import React, { useState, useEffect } from "react";
import { Container, Col, Form, Button, Card, Row } from "react-bootstrap";

import { useMutation } from "@apollo/client";
import { SAVE_game } from "../utils/mutations";
import { savegameIds, getSavedgameIds } from "../utils/localStorage";

import Auth from "../utils/auth";

const Searchgames = () => {
  // create state for holding returned google api data
  const [searchedGames, setsearchedGames] = useState([]);
  // create state for holding our search field data
  const [searchInput, setSearchInput] = useState("");

  // create state to hold saved gameId values
  const [savedgameIds, setSavedgameIds] = useState(getSavedgameIds());

  const [savegame, { error }] = useMutation(SAVE_game);

  // set up useEffect hook to save `savedgameIds` list to localStorage on component unmount
  // learn more here: https://reactjs.org/docs/hooks-effect.html#effects-with-cleanup
  useEffect(() => {
    return () => savegameIds(savedgameIds);
  });

  // create method to search for games and set state on form submit
  const handleFormSubmit = async (event) => {
    event.preventDefault();

    if (!searchInput) {
      return false;
    }

    try {
      const response = await fetch(
        `https://api.rawg.io/api/games/${searchInput}?key=14b551dec6924be882d50879bbe0e06f`
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const gameData = await response.json();

      const GameData = [
        {
          gameId: gameData.id,
          title: gameData.name,
          ratings: gameData.ratings_count,
          description: gameData.description,
          image: gameData.background_image,
        },
      ];

      setsearchedGames(GameData);
      setSearchInput("");
    } catch (err) {
      console.error(err);
    }
  };

  // create function to handle saving a game to our database
  const handleSavegame = async (gameId) => {
    // find the game in `searchedGames` state by the matching id
    const gameToSave = searchedGames.find((game) => game.gameId === gameId);

    // get token
    const token = Auth.loggedIn() ? Auth.getToken() : null;

    if (!token) {
      return false;
    }

    try {
      const { data } = await savegame({
        variables: { GameData: { ...gameToSave } },
      });
      console.log(savedgameIds);
      setSavedgameIds([...savedgameIds, gameToSave.gameId]);
    } catch (err) {
      console.error(err);
    }
  };
  return (
    <>
      <div className="text-info bg-black p-5">
        <Container>
          <h1>Search for games!</h1>
          <Form onSubmit={handleFormSubmit}>
            <Row>
              <Col xs={12} md={8}>
                <Form.Control
                  name="searchInput"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  type="text"
                  size="lg"
                  placeholder="Search for a game"
                />
              </Col>
              <Col xs={12} md={4}>
                <Button type="submit" variant="success" size="lg">
                  Submit Search
                </Button>
              </Col>
            </Row>
          </Form>
        </Container>
      </div>

      <Container>
        <h2 className="text-info pt-5">
          {searchedGames.length
            ? `Viewing ${searchedGames.length} results:`
            : "Search for a game to begin"}
        </h2>
        <Row>
          {searchedGames.map((game) => {
            return (
              <Col md="4">
                <Card key={game.gameId} border="dark" className="mb-3">
                  {game.image ? (
                    <Card.Img
                      src={game.image}
                      alt={`The cover for ${game.title}`}
                      variant="top"
                    />
                  ) : null}
                  <Card.Body>
                    <Card.Title>{game.gameId}</Card.Title>
                    <p className="small">rating: {game.ratings}</p>
                    <Card.Text>{game.description}</Card.Text>
                    {Auth.loggedIn() && (
                      <Button
                        disabled={savedgameIds?.some(
                          (savedId) => savedId === game.gameId
                        )}
                        className="btn-block btn-info"
                        onClick={() => handleSavegame(game.gameId)}
                      >
                        {savedgameIds?.some(
                          (savedId) => savedId === game.gameId
                        )
                          ? "game Already Saved!"
                          : "Save This game!"}
                      </Button>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      </Container>
    </>
  );
};

export default Searchgames;
