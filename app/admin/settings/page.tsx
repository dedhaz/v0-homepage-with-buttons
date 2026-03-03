"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

type Role = "admin" | "manager" | "user"

interface SystemUser {
  id: number
  email: string
  fullName: string
  role: Role
  createdAt?: string
}

export default function SettingsPage() {
  const [profile, setProfile] = useState({
    fullName: "",
    email: "",
  })
  const [meRole, setMeRole] = useState<Role>("user")
  const [users, setUsers] = useState<SystemUser[]>([])
  const [newUser, setNewUser] = useState({ fullName: "", email: "", password: "", role: "user" as Role })
  const [message, setMessage] = useState("")

  useEffect(() => {
    fetch("/api/profile/me")
      .then((response) => response.json())
      .then((result) => {
        if (result?.ok && result.user) {
          setProfile({ fullName: result.user.fullName ?? "", email: result.user.email ?? "" })
          setMeRole(result.user.role as Role)
        }
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    fetch("/api/admin/users")
      .then((response) => response.json())
      .then((result) => {
        if (result?.ok && Array.isArray(result.users)) {
          setUsers(result.users)
        }
      })
      .catch(() => {})
  }, [])

  const canManageRoles = meRole === "admin"
  const canViewUsers = meRole === "admin" || meRole === "manager"

  const roleLabel = useMemo(() => {
    if (meRole === "admin") return "Администратор"
    if (meRole === "manager") return "Менеджер"
    return "Пользователь"
  }, [meRole])

  async function saveProfile() {
    const response = await fetch("/api/profile/me", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    })

    setMessage(response.ok ? "Профиль сохранен" : "Не удалось сохранить профиль")
  }

  async function createSystemUser() {
    const response = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newUser),
    })

    if (!response.ok) {
      setMessage("Не удалось создать пользователя")
      return
    }

    const refreshed = await fetch("/api/admin/users").then((r) => r.json()).catch(() => null)
    if (refreshed?.ok && Array.isArray(refreshed.users)) {
      setUsers(refreshed.users)
    }

    setNewUser({ fullName: "", email: "", password: "", role: "user" })
    setMessage("Пользователь создан")
  }

  async function updateUser(user: SystemUser) {
    const response = await fetch(`/api/admin/users/${user.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName: user.fullName, role: user.role }),
    })

    setMessage(response.ok ? "Пользователь обновлен" : "Не удалось обновить пользователя")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Настройки</h1>
        <p className="text-sm text-muted-foreground">Роль: {roleLabel}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Мой профиль</CardTitle>
            <CardDescription>Редактирование профиля пользователя</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>ФИО</Label>
              <Input value={profile.fullName} onChange={(e) => setProfile({ ...profile, fullName: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>E-mail</Label>
              <Input type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
            </div>
            <Button className="w-full" onClick={saveProfile}>Сохранить профиль</Button>
          </CardContent>
        </Card>

        {canViewUsers && (
          <Card>
            <CardHeader>
              <CardTitle>Управление пользователями</CardTitle>
              <CardDescription>Админ: полные права. Менеджер: без назначения прав выше user.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {canManageRoles && (
                <>
                  <div className="space-y-2">
                    <Label>Новый пользователь: ФИО</Label>
                    <Input value={newUser.fullName} onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>E-mail</Label>
                    <Input type="email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Пароль</Label>
                    <Input type="password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Роль</Label>
                    <select
                      value={newUser.role}
                      onChange={(e) => setNewUser({ ...newUser, role: e.target.value as Role })}
                      className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    >
                      <option value="user">Пользователь</option>
                      <option value="manager">Менеджер</option>
                      <option value="admin">Администратор</option>
                    </select>
                  </div>
                  <Button className="w-full" onClick={createSystemUser}>Добавить пользователя</Button>
                  <Separator />
                </>
              )}

              <div className="space-y-3">
                {users.map((user) => (
                  <div key={user.id} className="rounded-md border border-border p-3 space-y-2">
                    <Input
                      value={user.fullName}
                      onChange={(e) => setUsers((prev) => prev.map((item) => item.id === user.id ? { ...item, fullName: e.target.value } : item))}
                    />
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                    <select
                      value={user.role}
                      disabled={!canManageRoles}
                      onChange={(e) => setUsers((prev) => prev.map((item) => item.id === user.id ? { ...item, role: e.target.value as Role } : item))}
                      className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm disabled:opacity-60"
                    >
                      <option value="user">Пользователь</option>
                      <option value="manager">Менеджер</option>
                      <option value="admin">Администратор</option>
                    </select>
                    <Button variant="outline" size="sm" onClick={() => updateUser(user)}>Сохранить</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {message && <p className="text-sm text-muted-foreground">{message}</p>}
    </div>
  )
}
