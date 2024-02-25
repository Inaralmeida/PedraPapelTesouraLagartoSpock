import "styled-components";
import { theme } from "./theme";
type Theme = typeof theme;

declare module "styled-components" {
  export interface DefaultTheme extends Theme {
    primary: string;
    backroundPrimary: string;
    backroundSecondary: string;
    text: string;
    scoreText: string;
    headerOutline: string;
    scissorsPrimary: string;
    paperPrimary: string;
    rockPrimary: string;
    lizardPrimary: string;
    spockPrimary: string;
    scissorsSecondary: string;
    paperSecondary: string;
    rockSecondary: string;
    lizardSecondary: string;
    spockSecondary: string;
  }
}
