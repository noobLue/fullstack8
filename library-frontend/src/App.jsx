import { useEffect, useState } from "react";
import Authors from "./components/Authors";
import Books from "./components/Books";
import NewBook from "./components/NewBook";
import LoginForm from "./components/LoginForm";
import { useApolloClient, useQuery } from "@apollo/client";
import { ME } from "./queries";

const App = () => {
  const [page, setPage] = useState("authors");
  const [token, setToken] = useState(null);
  const meResult = useQuery(ME); // TODO: reset state when token changes
  const client = useApolloClient();

  useEffect(() => {
    const t = localStorage.getItem("library-user-token");
    setToken(t);
  }, []);

  // Refetch ME query when token changes
  useEffect(() => {
    client.refetchQueries({
      include: [ME],
    });
  }, [token]);

  const logout = () => {
    setToken(null);
    localStorage.clear();
    client.resetStore();
  };

  const favoriteGenre =
    meResult.data && meResult.data.me ? meResult.data.me.favoriteGenre : null;

  return (
    <div>
      <div>
        <button onClick={() => setPage("authors")}>authors</button>
        <button onClick={() => setPage("books")}>books</button>
        {token && <button onClick={() => setPage("add")}>add book</button>}
        {token && (
          <button onClick={() => setPage("recommendations")}>
            recommendations
          </button>
        )}
        {token ? (
          <button onClick={logout}>logout</button>
        ) : (
          <button onClick={() => setPage("login")}>login</button>
        )}
      </div>

      <Authors show={page === "authors"} loggedIn={token !== null} />

      <Books show={page === "books"} client={client} />

      <NewBook show={page === "add"} />

      <Books
        show={page === "recommendations" && favoriteGenre}
        favoriteGenre={favoriteGenre}
        client={client}
      />

      <LoginForm show={page === "login"} setToken={setToken} />
    </div>
  );
};

export default App;
