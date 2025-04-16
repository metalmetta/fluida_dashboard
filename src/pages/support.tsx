import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Mail, MessageCircle, Phone, HelpCircle } from "lucide-react";
import { SubtitleCard } from "@/components/ui/subtitle-card";

const faqs = [
  {
    question: "How do I set up automatic payments?",
    answer:
      "To set up automatic payments, go to the Payments section and click on 'Payment Settings'. From there, you can add a payment method and enable automatic payments for your bills.",
  },
  {
    question: "Can I export my transaction history?",
    answer:
      "Yes, you can export your transaction history in various formats (CSV, PDF) from the Transactions page by clicking the 'Export' button in the top right corner.",
  },
  {
    question: "How do I add a new vendor?",
    answer:
      "To add a new vendor, navigate to the Contacts page and click 'Add Contact'. Select 'Vendor' as the contact type and fill in the required information.",
  },
  {
    question: "What payment methods are supported?",
    answer:
      "We support various payment methods including credit/debit cards, bank transfers (ACH), and wire transfers. You can manage your payment methods in the Settings > Billing section.",
  },
];

export default function Support() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-semibold">Support</h1>
          <p className="text-muted-foreground">Get help and support</p>
        </div>

        <SubtitleCard 
          text="Choose your preferred way to contact our support team."
          tooltip="Our support team is available Monday to Friday, 9am-5pm EST."
        />

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="p-6">
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="p-3 rounded-full bg-primary/10">
                <MessageCircle className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-medium">Live Chat</h3>
              <p className="text-sm text-muted-foreground">
                Chat with our support team
              </p>
              <Button className="mt-2" variant="outline">
                Start Chat
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="p-3 rounded-full bg-primary/10">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-medium">Email Support</h3>
              <p className="text-sm text-muted-foreground">
                support@getfluida.com
              </p>
              <Button className="mt-2" variant="outline">
                Send Email
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="p-3 rounded-full bg-primary/10">
                <Phone className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-medium">Phone Support</h3>
              <p className="text-sm text-muted-foreground">
                Mon-Fri, 9am-5pm EST
              </p>
              <Button className="mt-2" variant="outline">
                Call Us
              </Button>
            </div>
          </Card>
        </div>

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <HelpCircle className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-medium">Frequently Asked Questions</h2>
          </div>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger>{faq.question}</AccordionTrigger>
                <AccordionContent>{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Card>

        <Card className="p-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-medium">Contact Support</h2>
              <p className="text-sm text-muted-foreground">
                Send us a message and we'll get back to you as soon as possible.
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" placeholder="Your name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="Your email" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" placeholder="How can we help?" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Tell us more about your issue..."
                  rows={5}
                />
              </div>
              <Button>Send Message</Button>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
