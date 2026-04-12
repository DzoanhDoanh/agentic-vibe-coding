import React, { useContext, useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
        await login(values.email, values.password);
        message.success('Đăng nhập thành công!');
        navigate('/');
    } catch (error) {
        message.error(error.response?.data?.message || 'Đăng nhập thất bại!');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 p-4 font-sans">
      <div className="max-w-md w-full bg-white/80 rounded-2xl shadow-soft p-8 border border-white backdrop-blur-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 mb-4 shadow-sm">
            <UserOutlined className="text-3xl" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 m-0">Đăng nhập</h2>
          <p className="text-gray-500 mt-2">Hệ Thống MVPTutoring</p>
        </div>

        <Form name="login" onFinish={onFinish} layout="vertical" size="large">
          <Form.Item name="email" rules={[{ required: true, message: 'Vui lòng nhập Email!' }]}>
            <Input 
              prefix={<UserOutlined className="text-gray-400 mr-2" />} 
              placeholder="Email (vd: admin@system.com)" 
              className="rounded-lg h-12 text-base"
            />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: 'Vui lòng nhập Password!' }]}>
            <Input.Password 
              prefix={<LockOutlined className="text-gray-400 mr-2" />} 
              placeholder="Mật khẩu (vd: 123456)" 
              className="rounded-lg h-12 text-base"
            />
          </Form.Item>
          <Form.Item className="mt-8 mb-0">
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              className="w-full h-12 rounded-lg text-base font-semibold shadow-md shadow-blue-500/30"
            >
              Đăng nhập hệ thống
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default Login;
