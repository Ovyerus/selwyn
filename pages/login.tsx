import github from "@iconify/icons-simple-icons/github";
import { Icon } from "@iconify/react";
import React from "react";

import styles from "~/assets/style/login.module.css";

const LoginPage = () => (
  <div
    className={`p-2 flex items-center justify-center min-h-screen ${styles.bg}`}
  >
    <main className="w-full p-4 bg-white shadow-md rounded-xl sm:w-max sm:p-6">
      <a
        href="/api/auth"
        className="py-2 px-3 bg-[#181717] text-white flex items-center justify-center text-center rounded-md hover:shadow-lg transition"
      >
        <Icon icon={github} className="mr-3" />
        Sign in with GitHub
      </a>

      <hr className="mt-4 mb-3 border-gray-300" />
      <span className="block text-sm text-center w-full -mb-1 sm:-mb-2">
        Powered by{" "}
        <a
          href="https://github.com/ovyerus/selwyn"
          className="text-indigo-500 hover:underline"
        >
          Selwyn
        </a>
      </span>
    </main>
  </div>
);

export default LoginPage;
