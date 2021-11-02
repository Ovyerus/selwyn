import github from "@iconify/icons-simple-icons/github";
import { Icon } from "@iconify/react";
import React from "react";

import styles from "~/assets/style/login.module.css";

const LoginPage = () => (
  <div className="flex items-center justify-center min-h-screen p-2 bg">
    <main className={styles.card}>
      <a href="/api/auth" className={styles.ghButton}>
        <Icon icon={github} className="mr-3" />
        Sign in with GitHub
      </a>

      <hr className="mt-4 mb-3 border-gray-300 dark:border-gray-700" />
      <span className={styles.footer}>
        Powered by{" "}
        <a href="https://github.com/ovyerus/selwyn" className="link">
          Selwyn
        </a>
      </span>
    </main>
  </div>
);

export default LoginPage;
