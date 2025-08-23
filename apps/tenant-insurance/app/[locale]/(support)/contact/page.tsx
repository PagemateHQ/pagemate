import {getTranslations} from 'next-intl/server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default async function ContactPage() {
  const t = await getTranslations()
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">{t('Contact.title')}</h1>
        <p className="text-muted-foreground">{t('Contact.desc')}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('Contact.details.title')}</CardTitle>
            <CardDescription>{t('Contact.details.desc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                <span className="font-medium text-foreground">{t('Contact.details.support')}</span> support@acme.insurance
              </p>
              <p>
                <span className="font-medium text-foreground">{t('Contact.details.claims')}</span> claims@acme.insurance
              </p>
              <p>
                <span className="font-medium text-foreground">{t('Contact.details.phone')}</span> (800) 555‑0199
              </p>
              <p>{t('Contact.details.hours')}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t('Contact.form.title')}</CardTitle>
            <CardDescription>{t('Contact.form.desc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">{t('Common.labels.fullName')}</Label>
                <Input id="name" required placeholder={t('Common.placeholders.name')} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">{t('Common.labels.email')}</Label>
                <Input id="email" type="email" required placeholder={t('Common.placeholders.email')} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="msg">{t('Contact.form.message')}</Label>
                <Textarea id="msg" required placeholder={t('Contact.form.help')} />
              </div>
              <div>
                <Button>{t('Common.actions.send')}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

