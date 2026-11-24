import * as React from "react";
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
            <Button variant="accent" className="flex-shrink-0" onClick={goBack}>
              {"◀ " + t("go_back")}
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
