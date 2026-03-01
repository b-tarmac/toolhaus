import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center gradient-bg">
      <SignIn
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
