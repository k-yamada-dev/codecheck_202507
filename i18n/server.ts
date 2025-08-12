import i18next, { i18n as I18nInstance, Resource } from 'i18next';

type Ns = readonly string[];
const cache = new Map<string, Promise<I18nInstance>>();

export async function getServerI18n(lng: string, ns: Ns = ['common']): Promise<I18nInstance> {
  const key = `${lng}|${Array.from(ns).sort().join(',')}`;
  if (cache.has(key)) return cache.get(key)!;

  const instancePromise = (async () => {
    const resources: Resource = {};
    for (const n of ns) {
      const mod = await import(
        /* webpackMode: "lazy-once" */
        `@/public/locales/${lng}/${n}.json`
      );
      resources[lng] = { ...(resources[lng] ?? {}), [n]: mod.default[n] ?? mod.default };
    }

    const i18n = i18next.createInstance();
    await i18n.init({
      lng,
      fallbackLng: 'en',
      ns,
      resources,
      interpolation: { escapeValue: false },
    });
    return i18n;
  })();

  cache.set(key, instancePromise);
  return instancePromise;
}

export async function getT(lng: string, ns: Ns = ['common']) {
  const i18n = await getServerI18n(lng, ns);
  return i18n.getFixedT(lng, ns);
}
