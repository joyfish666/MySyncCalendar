/**
 * 节假日与调休数据生成工具（开发者工具）
 *
 * 用法: node scripts/generate-holidays.js [--next-year]
 * 默认生成今年 + 去年的数据，并清理两年前的文件。
 * --next-year 额外生成明年的数据（暂不启用）。
 *
 * 该工具不打包进最终程序，由开发者每年新数据发布后运行一次。
 */

const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, '..', 'src');

const DATA = {
  2025: {
    holidays: [
      { name: '元旦', dates: ['2025-01-01'] },
      { name: '春节', dates: ['2025-01-28','2025-01-29','2025-01-30','2025-01-31','2025-02-01','2025-02-02','2025-02-03','2025-02-04'] },
      { name: '清明节', dates: ['2025-04-04','2025-04-05','2025-04-06'] },
      { name: '劳动节', dates: ['2025-05-01','2025-05-02','2025-05-03','2025-05-04','2025-05-05'] },
      { name: '端午节', dates: ['2025-05-31','2025-06-01','2025-06-02'] },
      { name: '中秋节', dates: ['2025-10-06'] },
      { name: '国庆节', dates: ['2025-10-01','2025-10-02','2025-10-03','2025-10-04','2025-10-05','2025-10-07','2025-10-08'] },
    ],
    workdays: [
      '2025-01-26', '2025-02-08', '2025-04-27', '2025-09-28', '2025-10-11',
    ],
  },
  2026: {
    holidays: [
      { name: '元旦', dates: ['2026-01-01','2026-01-02','2026-01-03'] },
      { name: '春节', dates: ['2026-02-15','2026-02-16','2026-02-17','2026-02-18','2026-02-19','2026-02-20','2026-02-21','2026-02-22','2026-02-23'] },
      { name: '清明节', dates: ['2026-04-04','2026-04-05','2026-04-06'] },
      { name: '劳动节', dates: ['2026-05-01','2026-05-02','2026-05-03','2026-05-04','2026-05-05'] },
      { name: '端午节', dates: ['2026-06-19','2026-06-20','2026-06-21'] },
      { name: '中秋节', dates: ['2026-09-25','2026-09-26','2026-09-27'] },
      { name: '国庆节', dates: ['2026-10-01','2026-10-02','2026-10-03','2026-10-04','2026-10-05','2026-10-06','2026-10-07'] },
    ],
    workdays: [
      '2026-01-04', '2026-02-14', '2026-02-28', '2026-05-09', '2026-09-20', '2026-10-10',
    ],
  },
  2027: {
    holidays: [
      { name: '元旦', dates: ['2027-01-01','2027-01-02','2027-01-03'] },
      { name: '春节', dates: ['2027-02-05','2027-02-06','2027-02-07','2027-02-08','2027-02-09','2027-02-10','2027-02-11','2027-02-12'] },
      { name: '清明节', dates: ['2027-04-04','2027-04-05','2027-04-06'] },
      { name: '劳动节', dates: ['2027-05-01','2027-05-02','2027-05-03','2027-05-04','2027-05-05'] },
      { name: '端午节', dates: ['2027-06-08','2027-06-09','2027-06-10'] },
      { name: '中秋节', dates: ['2027-09-15','2027-09-16','2027-09-17'] },
      { name: '国庆节', dates: ['2027-10-01','2027-10-02','2027-10-03','2027-10-04','2027-10-05','2027-10-06','2027-10-07'] },
    ],
    workdays: [
      '2027-01-23', '2027-02-13', '2027-05-08', '2027-06-12', '2027-09-18', '2027-10-09',
    ],
  },
};

function generateYear(year) {
  const data = DATA[year];
  if (!data) {
    console.error(`No data for year ${year}. Add it to DATA in generate-holidays.js.`);
    process.exit(1);
  }

  const output = { year, holidays: {}, workdays: {} };

  for (const h of data.holidays) {
    for (const d of h.dates) {
      output.holidays[d] = h.name;
    }
  }

  for (const d of data.workdays) {
    output.workdays[d] = true;
  }

  const filePath = path.join(SRC_DIR, `holidays-${year}.json`);
  fs.writeFileSync(filePath, JSON.stringify(output, null, 2), 'utf-8');
  console.log(`Generated: ${filePath}`);
}

function cleanupOldFiles(currentYear, lastYear) {
  const files = fs.readdirSync(SRC_DIR).filter(f => /^holidays-\d{4}\.json$/.test(f));
  for (const f of files) {
    const y = Number(f.match(/\d{4}/)[0]);
    if (y < lastYear) {
      const p = path.join(SRC_DIR, f);
      fs.unlinkSync(p);
      console.log(`Removed old: ${f}`);
    }
  }
}

const currentYear = new Date().getFullYear();
const lastYear = currentYear - 1;
const includeNext = process.argv.includes('--next-year');

cleanupOldFiles(currentYear, lastYear);

generateYear(lastYear);
generateYear(currentYear);

if (includeNext) {
  generateYear(currentYear + 1);
}

console.log('Done.');