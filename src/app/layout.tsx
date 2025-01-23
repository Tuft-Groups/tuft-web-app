import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}

{
  /* <DropdownMenu>
<DropdownMenuTrigger asChild>
  <Button variant="outline" size="default">
    <SunIcon className="h-[1.4rem] w-[1.4rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
    <MoonIcon className="absolute h-[1.4rem] w-[1.4rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    <span className="sr-only">Toggle theme</span>
  </Button>
</DropdownMenuTrigger>
<DropdownMenuContent align="end">
  <DropdownMenuItem onClick={() => setTheme("light")}>Light</DropdownMenuItem>
  <DropdownMenuItem onClick={() => setTheme("dark")}>Dark</DropdownMenuItem>
  <DropdownMenuItem onClick={() => setTheme("system")}>System</DropdownMenuItem>
</DropdownMenuContent>
</DropdownMenu> */
}
