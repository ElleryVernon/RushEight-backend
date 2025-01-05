import axios from 'axios';

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function fetchUsers(page: number, pageSize: number) {
  const response = await axios.get(`${baseUrl}/api/users/ranked`, {
    params: { page, pageSize },
    headers: { 'Accept': 'application/json' }
  });
  return response.data;
}

export async function searchUsers(keyword: string) {
  const response = await axios.get(`${baseUrl}/api/users/search`, {
    params: { keyword },
    headers: { 'Accept': 'application/json' }
  });
  return response.data;
}

export async function deleteUser(userId: string) {
  const res = await fetch(`/api/users/${userId}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    throw new Error(`Failed to delete user: ${res.statusText}`);
  }
  return res.json();
} 