/* 「お守り」タイル用の商品写真を楽天の商品検索APIから取得し、ページ用の写真データに書き出す。
     誕生石: assets/charm_photos.js（CHARM_PHOTOS）  星座: assets/zodiac_charm_photos.js（ZODIAC_CHARM_PHOTOS）
   使い方（アプリIDとアクセスキーはリポジトリに入れない）:
     RWS_APP_ID=... RWS_ACCESS_KEY=... node tools/fetch_charm_photos.js [birthstone|zodiac]
   商品が売り切れて写真が消えることがあるので、数か月に1回取り直す。
   候補は tools/<対象>_candidates.json に保存。合わない商品は EXCLUDE に商品コードを足して
     node tools/fetch_charm_photos.js [birthstone|zodiac] --pick-only
   で選び直す（楽天への問い合わせなし）。 */
const fs = require("fs");
const path = require("path");

const PICK_ONLY = process.argv.indexOf("--pick-only") >= 0;
const APP_ID = process.env.RWS_APP_ID;
const ACCESS_KEY = process.env.RWS_ACCESS_KEY;
if (!PICK_ONLY && (!APP_ID || !ACCESS_KEY)) { console.error("RWS_APP_ID と RWS_ACCESS_KEY を指定してください"); process.exit(1); }

const ROOT = path.join(__dirname, "..");
const ENDPOINT = "https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20260701";
const SITE = "https://uranai-yakata.netlify.app";

const TARGET = process.argv.indexOf("zodiac") >= 0 ? "zodiac" : "birthstone";

// ページのデータ（タイル種類・石の名前・星座名など）を読み込む
global.document = { addEventListener: function () {} };
global.window = global;
["charm.js", "birthstones.js", "zodiac_data.js", "zodiac.js"].forEach(function (f) {
  (0, eval)(fs.readFileSync(path.join(ROOT, "assets", f), "utf8"));
});

// 商品名にこれが含まれていれば、その種類の商品とみなす
const TYPE_WORDS = {
  strap: ["ストラップ"], key: ["キーホルダー", "キーリング", "キーチェーン"], brooch: ["ブローチ"],
  hair: ["ヘア", "バレッタ", "かんざし", "簪", "ポニーフック"],
  bracelet: ["ブレスレット"], necklace: ["ネックレス", "ペンダント"],
  earring: ["イヤリング"], pierce: ["ピアス"], cuff: ["イヤーカフ", "イヤカフ"]
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function search(keyword) {
  const q = new URLSearchParams({
    applicationId: APP_ID, accessKey: ACCESS_KEY, keyword: keyword,
    hits: "30", imageFlag: "1", availability: "1", format: "json", formatVersion: "2"
  });
  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fetch(ENDPOINT + "?" + q, { headers: { Origin: SITE, Referer: SITE + "/" } });
    if (res.status === 429) { await sleep(3000); continue; }
    if (!res.ok) throw new Error(keyword + ": HTTP " + res.status + " " + (await res.text()).slice(0, 200));
    return (await res.json()).Items || [];
  }
  throw new Error(keyword + ": 回数上限（429）が続きました");
}

// 目で見て合わなかった商品（商品コード）。ここに入れると次の候補に差し替わる
const EXCLUDE_BIRTHSTONE = [
  "ginnokura:10037158",   // 黒いヘアゴム（石が見えない）
  "shinobiya:10047950",   // 写真が商品に見えない
  "horiku:10106877", "ohstore:10617305", "takumi-hagane:10000038", "takumi-hagane:10000052", "takumi-hagane:10000066", // 4月ストラップ：スマホ用
  "webike-rb:27521268", "nanakura:10000067", "auc-beagle:10282033", "candytower:10051688", "dtimes:10060883",          // 4月キーホルダー：石と無関係
  "printemps410:10003714",                                   // 5月キーホルダー：香水瓶のチャーム
  "horiku:10243326", "your-sales-shop:10360060",              // 7月キーホルダー：ルビーでない
  "b-shot:10043157", "hpsm:10010899", "hpsm:10009305", "printemps410:10004231", // 8月キーホルダー：石が見えない・ペンダント
  "ginnokura:10041182", "b-shot:10043154"                     // 11月キーホルダー：石が見えない
];

const EXCLUDE_ZODIAC = [
  // ネックレス：星座ごとに別商品だが、写真がどれも同じ共通画像
  "grand-galleria:10000706", "grand-galleria:10000707", "grand-galleria:10000708", "grand-galleria:10000709",
  "grand-galleria:10000710", "grand-galleria:10000711", "grand-galleria:10000712", "grand-galleria:10000713",
  "grand-galleria:10000714", "grand-galleria:10000715", "grand-galleria:10000716", "grand-galleria:10000717",
  // イヤーカフ：12星座まとめ売り（どの星座でも同じ写真）
  "ludique:10000568", "shadowtail:10752330", "tanzan-shop:10683146"
];

/* 対象ごとの設定
   slots: [{ id, label, keys: [検索に使う名前…], words: function(タイル)→1回目の検索語, words2: 2回目の検索語 }] */
const TARGETS = {
  birthstone: {
    candFile: "charm_candidates.json", outFile: "charm_photos.js", varName: "CHARM_PHOTOS", title: "誕生石",
    types: CHARM_TYPES.concat(CHARM_EAR_TYPES), exclude: EXCLUDE_BIRTHSTONE,
    slots: MONTHS.map(function (b) {
      const stone = charmStoneName(b.stones[0]);
      return { id: b.m, label: b.m + "月", names: [stone],
               words: (t) => stone + " " + t[1], words2: (t) => stone + " 天然石 " + t[1] };
    }),
    // 石そのものが主役の商品を前に
    bonus: /天然石|誕生石|パワーストーン|本真珠|真珠|鑑別/
  },
  zodiac: {
    candFile: "zodiac_candidates.json", outFile: "zodiac_charm_photos.js", varName: "ZODIAC_CHARM_PHOTOS", title: "星座",
    types: ZODIAC_CHARM_TYPES.concat(ZODIAC_CHARM_EAR_TYPES), exclude: EXCLUDE_ZODIAC,
    slots: ZODIAC.map(function (z) {
      const kana = ZODIAC_KANA[z.key];
      return { id: z.key, label: z.name, names: [z.name, kana],
               words: (t) => zodiacCharmWord(z, t) + " " + t[1],
               words2: (t) => (t[3] ? z.name : kana) + " " + t[1] };
    }),
    // 星座モチーフが主役の商品を前に
    bonus: /星座|コンステレーション|ホロスコープ|誕生石/,
    // 12星座まとめ売りの商品（商品名にほかの星座名がいくつも入る）は、どの星座でも同じ写真になるので後ろへ
    penalty: function (name) {
      const n = ZODIAC.filter((z) => name.indexOf(z.name) >= 0 || name.indexOf(ZODIAC_KANA[z.key]) >= 0).length;
      return /12星座|十二星座/.test(name) || n >= 3;
    }
  }
};
const CFG = TARGETS[TARGET];
const CAND_FILE = path.join(__dirname, CFG.candFile);
const EXCLUDE = CFG.exclude;
const types = CFG.types;

async function collect() {
  const cand = {};
  for (const s of CFG.slots) {
    cand[s.id] = {};
    for (const t of types) {
      // 商品名に「石・星座の名前」と「種類」の両方が入っているものだけ候補にする。少なければ言葉を変えて追加で探す
      const words = TYPE_WORDS[t[2]];
      const ok = (it) => s.names.some((n) => it.itemName.indexOf(n) >= 0) && words.some((w) => it.itemName.indexOf(w) >= 0);
      let list = (await search(s.words(t))).filter(ok);
      await sleep(1100); // 1秒に1回まで
      if (list.length < 5) {
        const more = (await search(s.words2(t))).filter(ok);
        list = list.concat(more.filter((m) => !list.some((l) => l.itemCode === m.itemCode)));
        await sleep(1100);
      }
      // 主役が分かる商品を前に。革・マネークリップ等（石やモチーフがほとんど見えない）は後ろへ
      const score = (it) => (CFG.bonus.test(it.itemName) ? 2 : 0) +
                            (/K10|K18|10金|18金|プラチナ|Pt900|SV925|シルバー925|ct|カラット/.test(it.itemName) ? 1 : 0) -
                            (/レザー|革|マネークリップ|コインケース|ギター|スマホケース/.test(it.itemName) ? 3 : 0) -
                            (CFG.penalty && CFG.penalty(it.itemName) ? 4 : 0);
      list = list.map((it, i) => ({ it: it, i: i })).sort((a, b) => score(b.it) - score(a.it) || a.i - b.i).map((x) => x.it);
      cand[s.id][t[2]] = list.filter((it) => it.mediumImageUrls && it.mediumImageUrls[0]).slice(0, 5)
        .map((it) => ({ code: it.itemCode, name: it.itemName, img: it.mediumImageUrls[0] }));
      console.log(s.label + " " + t[0] + ": 候補" + cand[s.id][t[2]].length + "件");
    }
  }
  fs.writeFileSync(CAND_FILE, JSON.stringify(cand, null, 1));
  return cand;
}

(async function () {
  const cand = PICK_ONLY ? JSON.parse(fs.readFileSync(CAND_FILE, "utf8")) : await collect();
  const out = {};
  for (const m in cand) {
    out[m] = {};
    for (const k in cand[m]) {
      const pick = cand[m][k].find((c) => EXCLUDE.indexOf(c.code) < 0);
      if (pick) out[m][k] = pick.img;
      console.log(m + " " + k + ": " + (pick ? pick.code + " " + pick.name.slice(0, 40) : "候補なし（イラストのまま）"));
    }
  }
  const js = "/* " + CFG.title + "「お守り」タイルの商品写真（楽天商品検索APIの画像URL）\n" +
             "   tools/fetch_charm_photos.js で自動生成。取得日: " + new Date().toISOString().slice(0, 10) + " */\n" +
             "var " + CFG.varName + " = " + JSON.stringify(out, null, 2) + ";\n";
  fs.writeFileSync(path.join(ROOT, "assets", CFG.outFile), js);
  console.log("書き出し完了: assets/" + CFG.outFile);
})().catch((e) => { console.error(e.message); process.exit(1); });
