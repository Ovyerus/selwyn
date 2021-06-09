import React from "react";

const message = process.env.NEXT_PUBLIC_SELWYN_MESSAGE || "👀 hi";

const IndexPage = () => <div>{message}</div>;

export default IndexPage;
