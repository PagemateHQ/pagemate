import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function ContactPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Contact Us</h1>
        <p className="text-muted-foreground">
          Questions about coverage, billing, or claims? We’re happy to help.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Contact Details</CardTitle>
            <CardDescription>How to reach our team.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                <span className="font-medium text-foreground">Support:</span> support@acme.insurance
              </p>
              <p>
                <span className="font-medium text-foreground">Claims:</span> claims@acme.insurance
              </p>
              <p>
                <span className="font-medium text-foreground">Phone:</span> (800) 555‑0199
              </p>
              <p>Mon–Fri 8am–8pm, Sat 9am–3pm</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Send us a message</CardTitle>
            <CardDescription>We’ll reply by email.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Full name</Label>
                <Input id="name" required placeholder="Jane Doe" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" required placeholder="you@example.com" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="msg">Message</Label>
                <Textarea id="msg" required placeholder="How can we help?" />
              </div>
              <div>
                <Button>Send</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
