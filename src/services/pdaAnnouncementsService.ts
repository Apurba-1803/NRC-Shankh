export type PDAPriority = "low" | "medium" | "high" | "normal";

export interface PDAAnnouncement {
  id?: number | string;
  title: string;
  message: string;
  priority: PDAPriority;
  isActive?: boolean;
  createdAt?: string;
  createdBy?: string;
}

const BASE_URL = `${import.meta.env.VITE_API_URL}/api`;

export async function createPDAAnnouncement(
  payload: Pick<PDAAnnouncement, "title" | "message" | "priority">
): Promise<PDAAnnouncement> {
  const accessToken = localStorage.getItem("accessToken");
  if (!accessToken) throw new Error("Authentication token not found");

  const res = await fetch(`${BASE_URL}/pd-announcements`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Failed to create PDA announcement: ${res.status} ${text}`);
  }

  const json = await res.json();
  return json.data || json;
}

export async function listPDAAnnouncements(): Promise<PDAAnnouncement[]> {
  const accessToken = localStorage.getItem("accessToken");
  if (!accessToken) throw new Error("Authentication token not found");

  const res = await fetch(`${BASE_URL}/pd-announcements`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch PDA announcements: ${res.status}`);
  }

  const json = await res.json();
  return Array.isArray(json.data) ? json.data : json;
}

export async function deletePDAAnnouncement(
  id: number | string
): Promise<void> {
  const accessToken = localStorage.getItem("accessToken");
  if (!accessToken) throw new Error("Authentication token not found");

  const res = await fetch(`${BASE_URL}/pd-announcements/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Failed to delete PDA announcement: ${res.status} ${text}`);
  }

  // DELETE requests might not return a body, so we just check for success
  return;
}

export async function updatePDAAnnouncement(
  id: number | string,
  payload: Partial<
    Pick<PDAAnnouncement, "title" | "message" | "priority" | "isActive">
  >
): Promise<PDAAnnouncement> {
  const accessToken = localStorage.getItem("accessToken");
  if (!accessToken) throw new Error("Authentication token not found");

  const res = await fetch(`${BASE_URL}/pd-announcements/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Failed to update PDA announcement: ${res.status} ${text}`);
  }

  const json = await res.json();
  return json.data || json;
}
