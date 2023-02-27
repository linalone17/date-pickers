import {Theme} from "../typings/Theme";
import {themeDark} from "../constants/themeDark";
import {themeLight} from "../constants/themeLight";

// interface CreateThemeArgs<T extends ('dark' | 'light' | Theme)> {
//     theme: T;
//     options?: T extends Theme ? never : Partial<Theme>;
// }
//
// type CreateThemeReturn<T> = T extends 'light'
//     ? typeof themeLight
//     : (T extends 'dark'
//         ? typeof themeDark
//         : Theme
//         );
//
// type Options = Partial<Theme>;
//
// export const createTheme = <T>({theme}:CreateThemeArgs<T>): Theme => {
//     if (theme === 'dark') {
//         return themeDark
//     }
//     if (theme === 'light') {
//         return themeLight
//     }
//     return theme;
// }
