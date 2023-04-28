import styles from "./Searchbar.module.css";
// import searchIcon from "../assets/searchIcon.svg";
import Fuse from "fuse.js";
import { useEffect, useState } from "react";
import { Course } from "../../types";
type OnSelectFunc = (val: string) => void;

type Props = {
  selector: string;
  data: Array<any>;
  getUnique: (data: any) => string;
  // resultString: (data: any) => string;
  placeholder: string;
  onSelect: (data: any) => void;
  keys: Array<string>;
  suggestionElement: (
    course: Course,
    classNames: string,
    value: string,
    onSelect: OnSelectFunc,
    key: string
  ) => JSX.Element;
  threshold?: number;
  shouldSort?: boolean;
  maxResults?: number;
};

const Searchbar = ({
  selector,
  data,
  getUnique,
  // resultString,
  placeholder,
  onSelect,
  keys,
  suggestionElement,
  threshold = 0.6,
  shouldSort,
  maxResults = 10,
}: Props) => {
  const [suggestions, setSuggestions] = useState<Array<any>>([]);
  const [query, setQuery] = useState("");
  const [inputText, setInputText] = useState("");
  const [currentItem, setCurrentItem] = useState(0);
  const fuse = new Fuse(data, {
    keys: keys,
    threshold: threshold,
    shouldSort: shouldSort || true,
  });
  const clearSuggestions = () => {
    document
      .querySelector(`.${styles.container}`)
      ?.classList.add(styles.notFocused);
    setSuggestions([]);
    setCurrentItem(-1);
    setInputText("");
    setQuery("");
  };

  useEffect(() => {
    const results = fuse.search(query);
    setSuggestions(results.map((ele) => ele.item).slice(0, maxResults));
  }, [query]);
  useEffect(() => {
    document.addEventListener("keydown", (e) => {
      if (e.code === "Escape") {
        clearSuggestions();
      }
    });
    document.addEventListener("mousedown", (e) => {
      let current = e.target as HTMLElement | null;
      while (
        current !== null &&
        !current?.classList?.contains(styles.container)
      )
        current = current.parentElement;
      if (current === null || !current?.classList?.contains(styles.container))
        clearSuggestions();
    });
  }, []);
  return (
    <div className={`${styles.container} ${styles.notFocused}`}>
      <input
        type="text"
        name="search"
        placeholder={placeholder}
        className={styles.input}
        id={selector}
        onInput={(e) => {
          const inputField = e.target as HTMLInputElement;
          setQuery(inputField.value);
          setInputText(inputField.value);
          setCurrentItem(-1);
        }}
        onFocus={(e) => {
          e.target?.parentElement?.classList.remove(styles.notFocused);
          setCurrentItem(-1);
        }}
        // onBlur={(e) => {
        // }}
        // onKeyDown{(e) => {
        //   console.log("down", e.code)
        // }}

        // onKeyPressCapture={(e) => {
        //   console.log("press - c", e.code);
        // }}
        // onKeyDownCapture={(e) => {
        //   console.log("down - c", e.code);
        // }}
        // onKeyUpCapture={(e) => {
        //   console.log("up - c", e.code);
        // }}
        // onKeyPress={(e) => {
        //   console.log("press", e.code);
        // }}
        onKeyUp={(e) => {
          console.log("up", e.code);
        }}
        onKeyDown={(e) => {
          const currentElement = document.querySelector(
            `.${styles.current}`
          ) as HTMLElement | null;
          const selectorElement = document.querySelector(
            `#${selector}`
          ) as HTMLElement | null;
          const targetElement = e.target as HTMLElement;
          switch (e.code) {
            case "ArrowDown":
              e.preventDefault();
              setCurrentItem((prevItem) => {
                if (prevItem + 1 < suggestions.length) {
                  ++prevItem;
                  setInputText(getUnique(suggestions[prevItem]));
                  return prevItem;
                }
                return prevItem;
              });
              break;
            case "ArrowUp":
              e.preventDefault();
              setCurrentItem((prevItem) => {
                if (prevItem - 1 >= 0) {
                  --prevItem;
                  setInputText(getUnique(suggestions[prevItem]));
                  return prevItem;
                }
                return prevItem;
              });
              break;
            case "Enter":
              // console.log(document.querySelector(`.${styles.current}`));
              if (currentElement) {
                currentElement.click();
              }
              if (selectorElement) {
                selectorElement.blur();
              }
              break;
            case "Tab":
              if (suggestions.length > 0) {
                e.preventDefault();
                if (targetElement) {
                  targetElement.focus();
                }
                if (e.shiftKey) {
                  setCurrentItem((prevItem) => {
                    if (prevItem - 1 >= 0) {
                      --prevItem;
                      setInputText(getUnique(suggestions[prevItem]));
                      return prevItem;
                    }
                    return prevItem;
                  });
                } else {
                  setCurrentItem((prevItem) => {
                    if (prevItem + 1 < suggestions.length) {
                      ++prevItem;
                      setInputText(getUnique(suggestions[prevItem]));
                      return prevItem;
                    }
                    return prevItem;
                  });
                }
              }
              break;
            default:
              break;
          }
        }}
        autoComplete="off"
        value={inputText}
      ></input>
      {query.length > 1 ? (
        <div className={styles.suggestions}>
          {suggestions.length > 0 ? (
            suggestions.map((suggestion, index) => {
              return suggestionElement(
                suggestion,
                `${styles.suggestion} ${
                  currentItem >= 0 &&
                  suggestions[currentItem] &&
                  getUnique(suggestion) === getUnique(suggestions[currentItem])
                    ? styles.current
                    : ""
                }`,
                getUnique(suggestion),
                (value) => {
                  onSelect(value);
                  clearSuggestions();
                },
                `${selector}-${suggestion}-${index}`
              );
            })
          ) : (
            <div>No Results</div>
          )}
        </div>
      ) : (
        <></>
      )}
    </div>
  );
};

export default Searchbar;
