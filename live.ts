const Cookie = process.env.GOCAST_COOKIE!;

export async function getPinned() {
  return await fetch("https://live.rbg.tum.de/api/courses/users/pinned", {
    headers: {
      Cookie,
    },
  }).then((res) => res.json());
}

export const getStreams = async (slug: string) => {
  const data = await fetch(`https://live.rbg.tum.de/api/courses/${slug}`).then(
    (res) => res.json()
  );

  const streams = data.Streams.filter((e: any) => !e.IsPlanned) as any[];

  return streams
    .map((e: any) => ({
      start: new Date(e.Start),
      id: slug + "/" + e.ID,
      slug,
      url: `https://live.rbg.tum.de/w/${slug}/${e.ID}`,
    }))
    .sort((a: any, b: any) => b.start.getTime() - a.start.getTime());
};

export async function getAllStreams(): Promise<ReturnType<typeof getStreams>> {
  const pinned = await getPinned();

  const streams = await Promise.all(
    pinned.map((e: any) => getStreams(e.Slug))
  ).then((e) => e.flat());

  return streams;
}
