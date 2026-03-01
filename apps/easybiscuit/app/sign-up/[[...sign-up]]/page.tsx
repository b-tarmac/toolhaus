import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center gradient-bg">
      <SignUp
        appearance={{
          variables: {
            colorPrimary: "#d97706",
            colorBackground: "#fafaf7",
          },
        }}
      />
    </div>
  );
}
