"use client";

import { LoginForm } from "@/components/login-form";
import { ThemeToggle } from "@/components/theme-toggle";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Loader from "@/components/ui/loader";
import FirebaseAuth from "@/lib/firebaseAuthClass";
import { useAppStore } from "@/store";
import { useEffect } from "react";

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  const { user, page_loading, getUserData, getUserRoomsData, setUserData, setPageLoading } = useAppStore();

  useEffect(() => {
    async function onInit() {
      await new Promise((resolve) => setTimeout(resolve, 500));
      // Get the Firebase User
      let user = new FirebaseAuth().getCurrentUser();

      // If the user is not found, wait for 1 second and try again. Sometimes the user is not found in the first attempt.
      if (!user) {
        console.log("User not found, retrying...");
        await new Promise((resolve) => setTimeout(resolve, 1000));
        user = new FirebaseAuth().getCurrentUser();
      }

      if (!user) return setPageLoading(false);
      await getUserData();
    }

    onInit();
  }, []);

  if (page_loading)
    return (
      <div className="flex items-center justify-center h-screen w-screen">
        <Loader loading className="h-10 w-10" />
      </div>
    );

  return (
    <div className="flex flex-col h-screen w-screen">
      {user && (
        <header className="w-full bg-white dark:bg-gray-800 shadow-sm shrink-0">
          <div className="p-2 flex items-center justify-between">
            <img src="/logo_with_border.png" alt="Tuft" className="h-8" />

            <div className="flex items-center gap-2">
              <ThemeToggle />
              {user && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Card className="flex px-2 py-2 pr-4 gap-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
                      <div className="w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center overflow-hidden">
                        {user.photo_url ? (
                          <img src={user.photo_url} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-sm font-medium">{user.name?.charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                      <span className="text-sm font-medium">{user.name}</span>
                    </Card>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => {
                        new FirebaseAuth().signOut();
                        setUserData(null);
                      }}
                    >
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </header>
      )}

      <div className="grow h-full overflow-y-scroll">
        {user ? (
          children
        ) : (
          <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
            <div className="flex items-center w-full max-w-sm flex-col gap-6">
              <LoginForm />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
