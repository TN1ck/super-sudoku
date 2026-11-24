import * as React from "react";
import {ArrowLeft} from "@phosphor-icons/react";
import GameSelect from "./Game/GameSelect";
import {Container} from "src/components/Layout";
import Button from "../components/Button";
import {useGame} from "src/context/GameContext";
import {useNavigate} from "@tanstack/react-router";
import {DarkModeButton} from "src/components/DarkModeButton";
import {useTranslation} from "react-i18next";

const SelectGame = () => {
  const navigate = useNavigate();
  const {pauseGame} = useGame();
  React.useEffect(pauseGame, [pauseGame]);
  const {t} = useTranslation();

  const goBack = () => {
    void navigate({
      to: "/",
    });
  };

  return (
    <Container className="mt-4">
      <div className="mb-8 flex flex-col gap-2">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-ink">{t("select_game_title")}</h1>
          <div className="flex items-center gap-2">
            <DarkModeButton />
            <Button variant="accent" className="inline-flex flex-shrink-0 items-center gap-1.5" onClick={goBack}>
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              <span>{t("go_back")}</span>
            </Button>
          </div>
        </div>
        <p className="text-ink-muted">{t("select_game_subtitle")}</p>
      </div>
      <GameSelect />
    </Container>
  );
};

export default SelectGame;
