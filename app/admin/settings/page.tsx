"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export default function SettingsPage() {
  const [profile, setProfile] = useState({
    name: "Администратор",
    email: "admin@sklad13.ru",
    phone: "+7 (999) 000-00-00",
    telegram: "@sklad13admin",
  })

  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Настройки</h1>
        <p className="text-sm text-muted-foreground">
          Управление профилем и параметрами системы
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Профиль менеджера</CardTitle>
            <CardDescription>Основная информация аккаунта</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="settings-name">ФИО</Label>
              <Input
                id="settings-name"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="settings-email">E-mail</Label>
              <Input
                id="settings-email"
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="settings-phone">Телефон</Label>
              <Input
                id="settings-phone"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="settings-telegram">Telegram</Label>
              <Input
                id="settings-telegram"
                value={profile.telegram}
                onChange={(e) => setProfile({ ...profile, telegram: e.target.value })}
              />
            </div>
            <Separator />
            <Button className="w-full">Сохранить изменения</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Смена пароля</CardTitle>
            <CardDescription>Обновите пароль вашего аккаунта</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Текущий пароль</Label>
              <Input
                id="current-password"
                type="password"
                placeholder="Введите текущий пароль"
                value={passwords.current}
                onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">Новый пароль</Label>
              <Input
                id="new-password"
                type="password"
                placeholder="Введите новый пароль"
                value={passwords.new}
                onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Подтвердите пароль</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="Повторите новый пароль"
                value={passwords.confirm}
                onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
              />
            </div>
            <Separator />
            <Button
              className="w-full"
              disabled={!passwords.current || !passwords.new || !passwords.confirm || passwords.new !== passwords.confirm}
            >
              Сменить пароль
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
