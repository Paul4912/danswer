import { Logo } from "../Logo";

export default function AuthFlowContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md bg-black p-8 mx-4 gap-y-4 flex items-center flex-col rounded-xl shadow-lg border border-border-medium">
        <Logo width={70} height={70} />
        {children}
      </div>
    </div>
  );
}
