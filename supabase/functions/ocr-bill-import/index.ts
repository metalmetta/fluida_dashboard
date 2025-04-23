
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import OpenAI from 'https://esm.sh/openai@^4.0.0';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!, 
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

const openai = new OpenAI({
  apiKey: Deno.env.get('OPENAI_API_KEY')!
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fileUrl, bucketName } = await req.json();

    // Download the PDF from Supabase storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from(bucketName)
      .download(fileUrl);

    if (downloadError) throw downloadError;

    // Convert file to base64
    const arrayBuffer = await fileData.arrayBuffer();
    const base64PDF = btoa(
      String.fromCharCode.apply(null, new Uint8Array(arrayBuffer))
    );

    // Use GPT-4o for OCR and data extraction
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `Extract structured bill information from the PDF. 
            Return a JSON with these fields:
            - vendor: string
            - amount: number
            - billNumber: string (optional)
            - dueDate: string (YYYY-MM-DD)
            - category: string (optional)
            - description: string (optional)
            - currency: string (optional, default USD)
            - documentUrl: string (URL of the uploaded PDF)
          `
        },
        {
          role: 'user',
          content: [
            { 
              type: 'text', 
              text: 'Extract bill details from this PDF' 
            },
            {
              type: 'image',
              image_url: { url: `data:application/pdf;base64,${base64PDF}` }
            }
          ]
        }
      ],
      response_format: { type: 'json_object' }
    });

    const billData = JSON.parse(response.choices[0].message.content!);
    billData.documentUrl = fileUrl;

    return new Response(JSON.stringify(billData), {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json' 
      }
    });
  } catch (error) {
    console.error('OCR Bill Import Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json' 
      }
    });
  }
});
