import { useEffect, useState } from "react";
import Authors from "./components/Authors";
import Books from "./components/Books";
import NewBook from "./components/NewBook";
import LoginForm from "./components/LoginForm";
import { useApolloClient } from "@apollo/client";

const App = () => {
  const [page, setPage] = useState("authors");
  const [token, setToken] = useState(null);
  const client = useApolloClient();

  useEffect(() => {
    const t = localStorage.getItem("library-user-token");
    setToken(t);
  }, []);

  const logout = () => {
    setToken(null);
    localStorage.clear();
    client.resetStore();

    // TODO: page not refreshing properly after logging out?
  };

  console.log(token !== null);

  return (
    <div>
      <div>
        <button onClick={() => setPage("authors")}>authors</button>
        <button onClick={() => setPage("books")}>books</button>
        {token && <button onClick={() => setPage("add")}>add book</button>}
        {token ? (
          <button onClick={() => console.log("logout")}>logout</button>
        ) : (
          <button onClick={() => setPage("login")}>login</button>
        )}
      </div>

      <Authors show={page === "authors"} loggedIn={token !== null} />

      <Books show={page === "books"} />

      <NewBook show={page === "add"} />

      <LoginForm show={page === "login"} setToken={setToken} />
    </div>
  );
};

export default App;
