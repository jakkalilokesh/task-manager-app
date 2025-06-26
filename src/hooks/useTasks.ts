const API_URL = "https://n4tv7n6nt9.execute-api.eu-north-1.amazonaws.com/dev/tasks";

export async function getUsers() {
  const res = await fetch(API_URL);
  return res.json();
}

export async function createUser(user: { id: string; name: string; email: string }) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user),
  });
  return res.json();
}
