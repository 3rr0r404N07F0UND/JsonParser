(() => {
  const fs = require("fs");
  let checkStringParser = false;
  let checkHelp = false;
  let fileName = "";
  let checkOutFile = false;
  let outFileName = "";
  for (let option in process.argv) {
    (process.argv[option] === "--string" || process.argv[option] === "-s") &&
      (checkStringParser = true);
    (process.argv[option] === "-h" || process.argv[option] === "--help") &&
      (checkHelp = true);
    (process.argv[option] === "-f" || process.argv[option] === "--file") &&
      (checkOutFile = true) &&
      (outFileName = process.argv[parseInt(option) + 1]);
    /.*\.json/.test(process.argv[option]) && (fileName = process.argv[option]);
  }
  class JsonParser {
    #inputArrayObject;
    constructor(object) {
      this.#inputArrayObject = object;
    }
    get parsingAll() {
      const tempVal = this.#inputArrayObject;
      const tempResult = this.objectParser(tempVal);
      return tempResult;
    }
    isPrimitive(inputVal, ...root) {
      if (typeof inputVal === "object") {
        if (Array.isArray(inputVal)) {
          return this.arrayParser(inputVal, root);
        } else {
          return this.objectParser(inputVal, root);
        }
      } else if (typeof inputVal === "string" && checkStringParser) {
        return this.stringParser(inputVal, root);
      } else {
        return `${root}: ${inputVal}\n`;
      }
    }
    objectParser(inputObject, ...root) {
      let output = "";
      for (let temp in inputObject) {
        output += this.isPrimitive(inputObject[temp], `${root}.${temp}`);
      }
      return output;
    }
    arrayParser(inputArray, ...root) {
      let output = "";
      inputArray.forEach((v, i) => {
        output += this.isPrimitive(v, `${root}[${i}]`);
      });
      return output;
    }
    stringParser(inputString, ...root) {
      let tempArray = [...inputString];
      let output = "";
      tempArray.forEach((v, i) => {
        output += `${root}[${i}]: ${v}\n`;
      });
      return output;
    }
  }
  if (checkHelp) {
    process.stdout.write(
      "-s, --string: 문자열도 파싱\n-h, --help: 명령어 모음\n-f, --file: log파일로 결과 출력"
    );
  } else {
    try {
      const data = JSON.parse(fs.readFileSync(fileName));
      const testing = new JsonParser(data);
      if (checkOutFile) {
        if (!outFileName) {
          outFileName = "result";
        }
        fs.writeFileSync(`${outFileName}.log`, testing.parsingAll);
      } else {
        process.stdout.write(testing.parsingAll);
      }
    } catch (e) {
      process.stdout.write("파일이 없습니다.\n다시 입력해주세요.");
    }
  }
})();
