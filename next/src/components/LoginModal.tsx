"use client";

import { useState } from 'react';
import { User, Mail, Lock } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function LoginModal() {
  const { isLoginModalOpen, closeLoginModal, isRegisterModalOpen, closeRegisterModal, login, register } = useAuth();

  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [registerData, setRegisterData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    nickname: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const isOpen = isLoginModalOpen || isRegisterModalOpen;
  const defaultTab = isRegisterModalOpen ? 'register' : 'login';

  const handleClose = () => {
    closeLoginModal();
    closeRegisterModal();
    // 重置表单
    setLoginData({ username: '', password: '' });
    setRegisterData({ username: '', email: '', password: '', confirmPassword: '', nickname: '' });
  };

  const handleLogin = async () => {
    if (!loginData.username || !loginData.password) {
      toast.error('请输入用户名和密码');
      return;
    }

    setIsLoading(true);
    const result = await login(loginData.username, loginData.password);
    setIsLoading(false);

    if (result.success) {
      toast.success('登录成功');
      handleClose();
    } else {
      toast.error(result.error || '登录失败');
    }
  };

  const handleRegister = async () => {
    const { username, email, password, confirmPassword, nickname } = registerData;

    if (!username || !email || !password) {
      toast.error('请填写所有必填项');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('两次输入的密码不一致');
      return;
    }

    if (password.length < 6) {
      toast.error('密码长度至少为6位');
      return;
    }

    setIsLoading(true);
    const result = await register(username, email, password, nickname);
    setIsLoading(false);

    if (result.success) {
      toast.success('注册成功');
      handleClose();
    } else {
      toast.error(result.error || '注册失败');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-[#111827]">账号登录</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">登录</TabsTrigger>
            <TabsTrigger value="register">注册</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="login-username">用户名/邮箱</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="login-username"
                  type="text"
                  placeholder="请输入用户名或邮箱"
                  value={loginData.username}
                  onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                  className="pl-10"
                  disabled={isLoading}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="login-password">密码</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="login-password"
                  type="password"
                  placeholder="请输入密码"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  className="pl-10"
                  disabled={isLoading}
                />
              </div>
            </div>
            <Button
              onClick={handleLogin}
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? '登录中...' : '登录'}
            </Button>
          </TabsContent>

          <TabsContent value="register" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="register-username">用户名 *</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="register-username"
                  type="text"
                  placeholder="请输入用户名"
                  value={registerData.username}
                  onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                  className="pl-10"
                  disabled={isLoading}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="register-email">邮箱 *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="register-email"
                  type="email"
                  placeholder="请输入邮箱"
                  value={registerData.email}
                  onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                  className="pl-10"
                  disabled={isLoading}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="register-nickname">昵称</Label>
              <Input
                id="register-nickname"
                type="text"
                placeholder="请输入昵称(可选)"
                value={registerData.nickname}
                onChange={(e) => setRegisterData({ ...registerData, nickname: e.target.value })}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="register-password">密码 *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="register-password"
                  type="password"
                  placeholder="请输入密码(至少6位)"
                  value={registerData.password}
                  onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                  className="pl-10"
                  disabled={isLoading}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="register-confirm-password">确认密码 *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="register-confirm-password"
                  type="password"
                  placeholder="请再次输入密码"
                  value={registerData.confirmPassword}
                  onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                  onKeyDown={(e) => e.key === 'Enter' && handleRegister()}
                  className="pl-10"
                  disabled={isLoading}
                />
              </div>
            </div>
            <Button
              onClick={handleRegister}
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? '注册中...' : '注册'}
            </Button>
            <p className="text-center text-xs text-gray-500">
              注册即表示您同意 OPC 服务条款和隐私政策
            </p>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
