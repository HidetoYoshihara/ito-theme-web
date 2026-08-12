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
    rawTags,
  };
};

export const isLoveTag = (tagString: string) => getTagState(tagString).isLove;
export const isHorroRT18ag = (tagString: string) =>
  getTagState(tagString).isHorror;
export const isDangeRT18ag = (tagString: string) =>
  getTagState(tagString).isDanger;
export const isContentTag = (tagString: string) =>
  getTagState(tagString).isContent;
export const isFairyTag = (tagString: string) => getTagState(tagString).isFairy;
export const isRT18ag = (tagString: string) => getTagState(tagString).isR;
