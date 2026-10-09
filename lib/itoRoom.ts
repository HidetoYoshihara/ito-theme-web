type ItoRoomCard = {
  room_id: string;
  player_id: number;
  card_number: number;
};

const getItoRoomEndpoint = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Supabase接続設定がありません。NEXT_PUBLIC_SUPABASE_URL と NEXT_PUBLIC_SUPABASE_ANON_KEY を設定してください。",
    );
  }

  return {
    endpoint: `${supabaseUrl.replace(/\/+$/, "")}/rest/v1/ito_room`,
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
    },
  };
};

const assertSuccessfulResponse = async (response: Response) => {
  if (response.ok) return;

  const detail = await response.text();
  throw new Error(
    `Supabaseへのリクエストに失敗しました (HTTP ${response.status})${detail ? `: ${detail}` : ""}`,
  );
};

export const saveItoRoomCards = async (
  roomId: string,
  cardNumbers: number[],
) => {
  const { endpoint, headers } = getItoRoomEndpoint();
  const records: ItoRoomCard[] = cardNumbers.map((cardNumber, index) => ({
    room_id: roomId,
    player_id: index + 1,
    card_number: cardNumber,
  }));
  const upsertUrl = new URL(endpoint);
  upsertUrl.searchParams.set("on_conflict", "room_id,player_id");

  const upsertResponse = await fetch(upsertUrl, {
    method: "POST",
    headers: {
      ...headers,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify(records),
  });
  await assertSuccessfulResponse(upsertResponse);

  const cleanupUrl = new URL(endpoint);
  cleanupUrl.searchParams.set("room_id", `eq.${roomId}`);
  cleanupUrl.searchParams.set("player_id", `gt.${cardNumbers.length}`);
  const cleanupResponse = await fetch(cleanupUrl, {
    method: "DELETE",
    headers,
  });
  await assertSuccessfulResponse(cleanupResponse);
};

export const getItoRoomCard = async (
  roomId: string,
  playerId: number,
): Promise<number | null> => {
  if (!Number.isInteger(playerId) || playerId < 1 || playerId > 10) {
    throw new Error("プレイヤーIDは1〜10の整数で指定してください。");
  }

  const { endpoint, headers } = getItoRoomEndpoint();
  const url = new URL(endpoint);
  url.searchParams.set("select", "card_number");
  url.searchParams.set("room_id", `eq.${roomId}`);
  url.searchParams.set("player_id", `eq.${playerId}`);

  const response = await fetch(url, { headers });
  await assertSuccessfulResponse(response);

  const records: unknown = await response.json();
  if (!Array.isArray(records)) {
    throw new Error("Supabaseから不正なカード情報が返されました。");
  }

  if (records.length === 0) return null;

  const record: unknown = records[0];
  if (
    typeof record !== "object" ||
    record === null ||
    !("card_number" in record)
  ) {
    throw new Error("Supabaseから不正なカード情報が返されました。");
  }

  const cardNumber = record.card_number;
  if (
    typeof cardNumber !== "number" ||
    !Number.isInteger(cardNumber) ||
    cardNumber < 1 ||
    cardNumber > 100
  ) {
    throw new Error("Supabaseから不正なカード番号が返されました。");
  }

  return cardNumber;
};
