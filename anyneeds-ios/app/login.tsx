import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/api';

const C = {
  bg: '#0a1628', card: '#162040', border: '#1e3060',
  accent: '#00c8e0', text: '#fff', textSub: '#8899bb', textMuted: '#556080',
  error: '#ff5252',
};

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  const startTimer = () => {
    setResendTimer(30);
    const iv = setInterval(() => {
      setResendTimer((t) => { if (t <= 1) { clearInterval(iv); return 0; } return t - 1; });
    }, 1000);
  };

  const handleSendOtp = async () => {
    setError('');
    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError('Enter a valid 10-digit Indian mobile number');
      return;
    }
    setLoading(true);
    try {
      await authApi.sendOtp(phone);
      setStep('otp');
      startTimer();
    } catch (e: any) {
      setError(e.response?.data?.error || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setError('');
    if (otp.length !== 6) { setError('Enter the 6-digit OTP'); return; }
    setLoading(true);
    try {
      const { data } = await authApi.verifyOtp(phone, otp);
      await login(data.token, data.user);
      router.replace('/(tabs)/profile' as any);
    } catch (e: any) {
      setError(e.response?.data?.error || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={s.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        <View style={s.logoRow}>
          <View style={s.logoBox}><Text style={s.logoBoxText}>AN</Text></View>
          <Text style={s.logoText}>AnyNeeds<Text style={{ color: C.accent }}>.in</Text></Text>
        </View>

        {step === 'phone' ? (
          <>
            <Text style={s.title}>Login / Sign up</Text>
            <Text style={s.sub}>We'll send an OTP to your mobile number</Text>

            <View style={s.phoneRow}>
              <View style={s.prefix}><Text style={s.prefixText}>🇮🇳 +91</Text></View>
              <TextInput
                style={s.phoneInput}
                placeholder="Enter mobile number"
                placeholderTextColor={C.textMuted}
                value={phone}
                onChangeText={(t) => setPhone(t.replace(/\D/g, '').slice(0, 10))}
                keyboardType="number-pad"
                maxLength={10}
                autoFocus
              />
            </View>
            {error ? <Text style={s.error}>{error}</Text> : null}
            <TouchableOpacity style={s.btn} onPress={handleSendOtp} disabled={loading}>
              <Text style={s.btnText}>{loading ? 'Sending...' : 'Get OTP'}</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={s.title}>Enter OTP</Text>
            <Text style={s.sub}>Sent to +91 {phone}</Text>

            <TextInput
              style={[s.input, s.otpInput]}
              placeholder="6-digit OTP"
              placeholderTextColor={C.textMuted}
              value={otp}
              onChangeText={(t) => setOtp(t.replace(/\D/g, '').slice(0, 6))}
              keyboardType="number-pad"
              maxLength={6}
              autoFocus
            />
            {error ? <Text style={s.error}>{error}</Text> : null}
            <TouchableOpacity style={s.btn} onPress={handleVerifyOtp} disabled={loading}>
              <Text style={s.btnText}>{loading ? 'Verifying...' : 'Verify OTP'}</Text>
            </TouchableOpacity>

            <View style={s.resendRow}>
              <TouchableOpacity onPress={handleSendOtp} disabled={resendTimer > 0}>
                <Text style={{ color: resendTimer > 0 ? C.textMuted : C.accent, fontSize: 13 }}>
                  {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { setStep('phone'); setOtp(''); setError(''); }}>
                <Text style={{ color: C.textSub, fontSize: 13, textDecorationLine: 'underline' }}>
                  Change number
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        <Text style={s.terms}>
          By continuing you agree to our Terms of Service and Privacy Policy
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 32 },
  logoBox: {
    width: 44, height: 44, backgroundColor: C.accent, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  logoBoxText: { color: '#000', fontWeight: '800', fontSize: 14 },
  logoText: { fontSize: 24, fontWeight: '800', color: C.text },
  title: { fontSize: 26, fontWeight: '700', color: C.text, marginBottom: 8 },
  sub: { fontSize: 14, color: C.textSub, marginBottom: 24 },
  phoneRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: C.card,
    borderWidth: 1.5, borderColor: C.border, borderRadius: 10, overflow: 'hidden', marginBottom: 12,
  },
  prefix: { paddingHorizontal: 12, borderRightWidth: 1, borderRightColor: C.border, paddingVertical: 13 },
  prefixText: { color: C.textSub, fontSize: 14 },
  phoneInput: { flex: 1, padding: 13, color: C.text, fontSize: 16 },
  input: {
    backgroundColor: C.card, borderWidth: 1.5, borderColor: C.border,
    borderRadius: 10, padding: 14, color: C.text, fontSize: 15, marginBottom: 12,
  },
  otpInput: { fontSize: 22, textAlign: 'center', letterSpacing: 10, fontWeight: '700' },
  error: {
    color: C.error, fontSize: 13, backgroundColor: 'rgba(255,82,82,0.1)',
    padding: 10, borderRadius: 8, marginBottom: 12,
  },
  btn: { backgroundColor: C.accent, borderRadius: 10, paddingVertical: 15, alignItems: 'center', marginBottom: 16 },
  btnText: { color: '#000', fontWeight: '700', fontSize: 16 },
  resendRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  terms: { fontSize: 11, color: C.textMuted, textAlign: 'center', lineHeight: 16, marginTop: 16 },
});
