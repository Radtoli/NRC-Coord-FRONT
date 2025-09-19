"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService } from "@/lib/services/auth.service";
import { Eye, EyeOff, Loader2 } from "lucide-react";

interface ChangePasswordFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function ChangePasswordForm({ onSuccess, onCancel }: ChangePasswordFormProps) {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleInputChange = (field: keyof typeof formData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    // Limpar mensagens quando o usuário começar a digitar
    if (error) setError(null);
    if (success) setSuccess(null);
  };

  const validateForm = (): string | null => {
    if (!formData.currentPassword) {
      return "Senha atual é obrigatória";
    }
    if (!formData.newPassword) {
      return "Nova senha é obrigatória";
    }
    if (formData.newPassword.length < 6) {
      return "Nova senha deve ter pelo menos 6 caracteres";
    }
    if (formData.newPassword !== formData.confirmPassword) {
      return "As senhas não coincidem";
    }
    if (formData.currentPassword === formData.newPassword) {
      return "A nova senha deve ser diferente da senha atual";
    }
    return null;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await authService.changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });

      if (response.success) {
        setSuccess("Senha alterada com sucesso!");
        // Aguardar um pouco para mostrar a mensagem de sucesso
        setTimeout(() => {
          onSuccess();
        }, 1500);
      } else {
        setError(response.message || "Erro ao alterar senha");
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Erro interno. Tente novamente.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    });
    setError(null);
    setSuccess(null);
    onCancel();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Senha Atual */}
      <div className="space-y-2">
        <Label htmlFor="currentPassword">Senha Atual</Label>
        <div className="relative">
          <Input
            id="currentPassword"
            type={showCurrentPassword ? "text" : "password"}
            value={formData.currentPassword}
            onChange={handleInputChange("currentPassword")}
            placeholder="Digite sua senha atual"
            className="pr-10"
            disabled={isLoading}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
            disabled={isLoading}
          >
            {showCurrentPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Nova Senha */}
      <div className="space-y-2">
        <Label htmlFor="newPassword">Nova Senha</Label>
        <div className="relative">
          <Input
            id="newPassword"
            type={showNewPassword ? "text" : "password"}
            value={formData.newPassword}
            onChange={handleInputChange("newPassword")}
            placeholder="Digite sua nova senha"
            className="pr-10"
            disabled={isLoading}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowNewPassword(!showNewPassword)}
            disabled={isLoading}
          >
            {showNewPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Mínimo de 6 caracteres
        </p>
      </div>

      {/* Confirmar Nova Senha */}
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            value={formData.confirmPassword}
            onChange={handleInputChange("confirmPassword")}
            placeholder="Digite novamente sua nova senha"
            className="pr-10"
            disabled={isLoading}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            disabled={isLoading}
          >
            {showConfirmPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Mensagens de erro/sucesso */}
      {error && (
        <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
          {error}
        </div>
      )}

      {success && (
        <div className="text-sm text-green-600 bg-green-50 p-3 rounded-md">
          {success}
        </div>
      )}

      {/* Botões */}
      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
          disabled={isLoading}
          className="flex-1"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          className="flex-1"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Alterando...
            </>
          ) : (
            "Alterar Senha"
          )}
        </Button>
      </div>
    </form>
  );
}