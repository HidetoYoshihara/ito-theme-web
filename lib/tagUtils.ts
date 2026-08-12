const splitTags = (tagString: string) =>
  tagString
    .split("#")
    .map((tag) => tag.trim())
    .filter(Boolean);

export const parseTags = (tagString: string) => splitTags(tagString);

export const hasExactTag = (tagString: string, target: string) =>
  splitTags(tagString).includes(target);

export type TagState = {
  isLove: boolean;
  isHorror: boolean;
  isDanger: boolean;
  isContent: boolean;
  isFairy: boolean;
  isR: boolean;
  isR18: boolean;
  rawTags: string[];
};

export const getTagState = (tagString: string): TagState => {
  const rawTags = splitTags(tagString);
  const hasTag = (target: string) => rawTags.includes(target);

  return {
    isLove: hasTag("恋愛"),
    isHorror: hasTag("ホラー"),
    isDanger: hasTag("ヤバい"),
    isContent: hasTag("コンテンツ系"),
    isFairy: hasTag("童話"),
    isR: hasTag("R指定"),
    isR18: /(?:^|#)(?:R指定|R-?18)(?:$|#)/i.test(tagString),
    rawTags,
  };
};

export const isLoveTag = (tagString: string) => getTagState(tagString).isLove;
export const isHorrorTag = (tagString: string) =>
  getTagState(tagString).isHorror;
export const isDangerTag = (tagString: string) =>
  getTagState(tagString).isDanger;
export const isContentTag = (tagString: string) =>
  getTagState(tagString).isContent;
export const isFairyTag = (tagString: string) => getTagState(tagString).isFairy;
export const isRTag = (tagString: string) => getTagState(tagString).isR;
export const isR18Tag = (tagString: string) => getTagState(tagString).isR18;
