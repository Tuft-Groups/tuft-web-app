import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { API_URLS } from "@/constants/api_urls";
import makeApiCall from "@/lib/api_wrapper";
import FirebaseAuth from "@/lib/firebaseAuthClass";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import Image from "next/image";
import { useMemo, useState } from "react";
import { PhoneInput } from "./ui/phone-input";

export function LoginForm({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [isPhoneAuth, setIsPhoneAuth] = useState(true);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const firebaseAuth = useMemo(() => new FirebaseAuth(), []);
  const { getUserData } = useAppStore();

  const sendOtp = async (number: string) => {
    setLoading(true);
    await firebaseAuth.signInWithPhoneNumber(number);
    setIsOtpSent(true);
    setLoading(false);
  };

  const verifyOtp = async (code: string) => {
    setLoading(true);
    const user = await firebaseAuth.confirmPhoneNumber(code);
    if (!user) {
      setError("Invalid OTP");
      setLoading(false);
      return;
    }
    const userData = await makeApiCall({
      method: "POST",
      url: API_URLS.PHONE_AUTH,
      body: { name: user.displayName, phone: user.phoneNumber, uid: user.uid },
    });
    getUserData();
    setLoading(false);
  };

  const oauthSignIn = async (provider: "google" | "apple") => {
    let user;
    if (provider === "apple") user = await new FirebaseAuth().signInWithApple();
    else user = await new FirebaseAuth().signInWithGoogle();
    const userData = await makeApiCall({
      method: "POST",
      url: API_URLS.GOOGLE_AUTH,
      body: { name: user.user.displayName, photo_url: user.user.photoURL, email: user.user.email, uid: user.user.uid },
    });
    getUserData();
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center flex flex-col items-center">
          <Image className="mb-4" src={"/short_logo_with_border.png"} alt="Tuft" width={80} height={80} />
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>Login into join your first group or to create one</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            {isPhoneAuth ? (
              <div>
                {isOtpSent ? (
                  <div className="flex flex-col items-center">
                    <p className="text-center text-sm text-muted-foreground mb-4">
                      Enter the 6-digit code sent to your phone
                    </p>
                    <InputOTP
                      maxLength={6}
                      autoFocus
                      pattern={REGEXP_ONLY_DIGITS}
                      onComplete={async (value) => await verifyOtp(value)}
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} className="size-12" />
                        <InputOTPSlot index={1} className="size-12" />
                        <InputOTPSlot index={2} className="size-12" />
                        <InputOTPSlot index={3} className="size-12" />
                        <InputOTPSlot index={4} className="size-12" />
                        <InputOTPSlot index={5} className="size-12" />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                ) : (
                  <PhoneInput
                    defaultCountry="IN"
                    disabled={loading}
                    onChange={async (value) => {
                      setPhoneNumber(value);
                      if (value?.startsWith("+91") && value.length === 13) await sendOtp(value);
                    }}
                    placeholder="Enter Phone Number"
                  />
                )}
                <div id="recaptcha-container"></div>
                <Button
                  id="send-otp-button"
                  disabled={loading}
                  className="mt-4 w-full"
                  onClick={async () => {
                    if (isOtpSent) await verifyOtp(code);
                    else await sendOtp(phoneNumber);
                  }}
                >
                  {loading ? "Loading..." : "Continue"}
                </Button>
              </div>
            ) : (
              <>
                <Input type="email" placeholder="Email" />
                <Input type="password" placeholder="Password" />
              </>
            )}
            <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
              <span className="relative z-10 bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
            <div className="flex gap-4 items-center justify-center">
              <Button variant="outline" onClick={() => oauthSignIn("google")} className="w-full">
                <Image src={"/google_logo.png"} alt="Google" width={28} height={28} />

                <span className="ml-2">Login with Google</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary  ">
        By clicking continue, you agree to our <a href="https://tuft.in/terms_and_conditions">Terms of Service</a> and{" "}
        <a href="https://tuft.in/privacy_policy">Privacy Policy</a>.
      </div>
    </div>
  );
}
