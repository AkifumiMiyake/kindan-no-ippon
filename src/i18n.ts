export type Locale = 'ja' | 'en' | 'ko'

export type Dictionary = {
  appTitle: string
  kicker: string
  subtitle: string
  noticeLine1: string
  noticeLine2: string
  languageLabel: string
  scareLegend: string
  scareLight: string
  scareLightSub: string
  scareNormal: string
  scareNormalSub: string
  scareStrong: string
  scareStrongSub: string
  scareSurprise: string
  scareSurpriseSub: string
  runtimeLegend: string
  runtimeShort: string
  runtimeMedium: string
  runtimeLong: string
  eraLegend: string
  eraNew: string
  eraClassic: string
  eraAny: string
  spinButton: string
  spinningButton: string
  spinningHint: string
  resultAgain: string
  statusFetching: string
  statusSpinning: string
  errorFetch: string
  errorApiUnavailable: string
  errorNoResults: string
  errorNetwork: string
  resultLabel: string
  closeLabel: string
  noPoster: string
  releaseUnknown: string
  runtimeUnknown: string
  overviewFallback: string
  decideButton: string
  decidedButton: string
  respinButton: string
  trailerButton: string
  decisionLine1: string
  decisionLine2: string
  footerCredit: string
  loadingDetails: string
  sectionHeadline: string
  sectionDescription: string
  releaseYear: (year: string) => string
  runtimeMinutes: (minutes: number) => string
}

export const I18N: Record<Locale, Dictionary> = {
  ja: {
    appTitle: '禁断の一本',
    kicker: '回したら、戻れない。',
    subtitle: 'ルーレットが決める、今夜の一本。',
    noticeLine1: 'ホラー映画の中から、今夜観る一本を',
    noticeLine2: 'ルーレットで決めるアプリです。',
    languageLabel: '言語',
    scareLegend: '怖さレベル',
    scareLight: '軽め',
    scareLightSub: '心理・雰囲気',
    scareNormal: '普通',
    scareNormalSub: '王道ホラー',
    scareStrong: '強め',
    scareStrongSub: '過激OK',
    scareSurprise: 'おまかせ',
    scareSurpriseSub: '全開放',
    runtimeLegend: '尺',
    runtimeShort: '〜90分',
    runtimeMedium: '90〜120分',
    runtimeLong: '120分〜',
    eraLegend: '新しさ',
    eraNew: '新しめ',
    eraClassic: '名作',
    eraAny: 'こだわらない',
    spinButton: '恐怖を回す',
    spinningButton: '運命が回転中…',
    spinningHint: '停止まで操作できません。深呼吸して待って。',
    resultAgain: '結果をもう一度見る',
    statusFetching: '候補を集めています…',
    statusSpinning: 'ルーレットが回っています…',
    errorFetch: 'TMDBから候補を取得できませんでした。',
    errorApiUnavailable: 'APIが応答していません。`vercel dev` で起動してください。',
    errorNoResults: '条件に合う作品が見つかりませんでした。',
    errorNetwork: '通信に失敗しました。',
    resultLabel: 'TONIGHT',
    closeLabel: '閉じる',
    noPoster: 'ポスターなし',
    releaseUnknown: '公開年不明',
    runtimeUnknown: '上映時間不明',
    overviewFallback: '今夜の一本、決定。',
    decideButton: '今夜はこれにする',
    decidedButton: '決まりました',
    respinButton: 'もう一回怖がる',
    trailerButton: '予告編をYouTubeで検索',
    decisionLine1: '今夜は、これでいきましょう。',
    decisionLine2: 'いい時間になりますように。',
    footerCredit:
      'This product uses the TMDB API but is not endorsed or certified by TMDB.',
    loadingDetails: '詳細を読み込み中…',
    sectionHeadline: '迷う夜に、禁断の選択を',
    sectionDescription:
      '「何を観るか決められない」そんな夜のために作ったのが、禁断の一本です。\nホラー映画限定で、条件を選ぶだけ。あとはルーレットが今夜観る一本を即決します。\n検索も比較も必要ありません。迷う時間を、恐怖の時間に変えてみてください。',
    releaseYear: (year) => `公開：${year}`,
    runtimeMinutes: (minutes) => `上映時間：${minutes}分`,
  },
  en: {
    appTitle: 'Kindan no Ippon',
    kicker: 'Once you spin, there is no turning back.',
    subtitle: 'The roulette decides tonight’s one.',
    noticeLine1: 'Pick one horror movie for tonight,',
    noticeLine2: 'decided by roulette only.',
    languageLabel: 'Language',
    scareLegend: 'Scare Level',
    scareLight: 'Light',
    scareLightSub: 'Psychological',
    scareNormal: 'Classic',
    scareNormalSub: 'Standard horror',
    scareStrong: 'Intense',
    scareStrongSub: 'Extreme OK',
    scareSurprise: 'Surprise',
    scareSurpriseSub: 'Anything goes',
    runtimeLegend: 'Runtime',
    runtimeShort: '≤ 90 min',
    runtimeMedium: '90–120 min',
    runtimeLong: '≥ 120 min',
    eraLegend: 'Era',
    eraNew: 'New',
    eraClassic: 'Classic',
    eraAny: 'No preference',
    spinButton: 'Spin the terror',
    spinningButton: 'Fate is spinning…',
    spinningHint: 'No actions until it stops. Breathe.',
    resultAgain: 'View result again',
    statusFetching: 'Gathering candidates…',
    statusSpinning: 'Roulette is spinning…',
    errorFetch: 'Failed to load candidates from TMDB.',
    errorApiUnavailable: 'API is not responding. Run `vercel dev`.',
    errorNoResults: 'No movies match your filters.',
    errorNetwork: 'Network error.',
    resultLabel: 'TONIGHT',
    closeLabel: 'Close',
    noPoster: 'No Poster',
    releaseUnknown: 'Release year unknown',
    runtimeUnknown: 'Runtime unknown',
    overviewFallback: 'Tonight’s pick is locked in.',
    decideButton: 'Let’s go with this',
    decidedButton: 'Decided',
    respinButton: 'Spin again',
    trailerButton: 'Search trailer on YouTube',
    decisionLine1: 'Let’s go with this tonight.',
    decisionLine2: 'Hope you have a great time.',
    footerCredit:
      'This product uses the TMDB API but is not endorsed or certified by TMDB.',
    loadingDetails: 'Loading details…',
    sectionHeadline: 'When You Can’t Decide What to Watch',
    sectionDescription:
      'Kindan no Ippon was created for nights when you just can’t decide what to watch.\nChoose a few conditions, and our horror-only roulette instantly picks tonight’s movie.\nNo searching. No comparing. Turn indecision into a night of fear.',
    releaseYear: (year) => `Release: ${year}`,
    runtimeMinutes: (minutes) => `Runtime: ${minutes} min`,
  },
  ko: {
    appTitle: 'Kindan no Ippon',
    kicker: '돌리면 돌아갈 수 없습니다.',
    subtitle: '룰렛이 오늘 밤 한 편을 정합니다.',
    noticeLine1: '공포 영화 중에서 오늘 밤 볼 한 편을',
    noticeLine2: '룰렛으로 정하는 앱입니다.',
    languageLabel: '언어',
    scareLegend: '공포 강도',
    scareLight: '약함',
    scareLightSub: '심리/분위기',
    scareNormal: '보통',
    scareNormalSub: '정통 호러',
    scareStrong: '강함',
    scareStrongSub: '과감 OK',
    scareSurprise: '랜덤',
    scareSurpriseSub: '전부 OK',
    runtimeLegend: '길이',
    runtimeShort: '90분 이하',
    runtimeMedium: '90–120분',
    runtimeLong: '120분 이상',
    eraLegend: '시대',
    eraNew: '최근',
    eraClassic: '명작',
    eraAny: '상관없음',
    spinButton: '공포를 돌리기',
    spinningButton: '운명이 돌고 있습니다…',
    spinningHint: '멈출 때까지 기다려 주세요.',
    resultAgain: '결과 다시 보기',
    statusFetching: '후보를 모으는 중…',
    statusSpinning: '룰렛이 돌아가는 중…',
    errorFetch: 'TMDB에서 후보를 불러오지 못했습니다.',
    errorApiUnavailable: 'API가 응답하지 않습니다. `vercel dev`를 실행하세요.',
    errorNoResults: '조건에 맞는 작품이 없습니다.',
    errorNetwork: '네트워크 오류입니다.',
    resultLabel: 'TONIGHT',
    closeLabel: '닫기',
    noPoster: '포스터 없음',
    releaseUnknown: '개봉 연도 없음',
    runtimeUnknown: '상영시간 없음',
    overviewFallback: '오늘 밤의 한 편이 결정되었습니다.',
    decideButton: '이걸로 결정',
    decidedButton: '결정됨',
    respinButton: '다시 돌리기',
    trailerButton: 'YouTube에서 예고편 검색',
    decisionLine1: '오늘 밤은 이걸로 가죠.',
    decisionLine2: '좋은 시간 되세요.',
    footerCredit:
      'This product uses the TMDB API but is not endorsed or certified by TMDB.',
    loadingDetails: '상세 정보 불러오는 중…',
    sectionHeadline: '결정하지 못하는 밤에, 금단의 선택을',
    sectionDescription:
      "무엇을 볼지 결정하지 못하는 밤을 위해 만들어진 것이 ‘금단의 한 편’입니다.\n호러 영화만을 대상으로, 조건을 고르면 룰렛이 오늘 밤의 영화를 즉시 결정합니다.\n검색도 비교도 필요 없습니다. 망설임의 시간을 공포의 시간으로 바꿔보세요.",
    releaseYear: (year) => `개봉: ${year}`,
    runtimeMinutes: (minutes) => `상영시간: ${minutes}분`,
  },
}

export const localeToLanguage = (locale: Locale) => {
  switch (locale) {
    case 'en':
      return 'en-US'
    case 'ko':
      return 'ko-KR'
    case 'ja':
    default:
      return 'ja-JP'
  }
}
