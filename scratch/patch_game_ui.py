import re

file_path = r"C:\Users\sr_ir\Documents\proyectos\K\K\components\GameUI.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Part 1: Add storyGuardians and 10+ Quotes per Character in guardianQuotePools
old_quotes_block = """    const guardianQuotePools = useMemo(() => [
      // Level 1: Piscina De La Muerte
      [
        "¡Oye! ¿Podrías apurarte? Mi chimichanga se está enfriando.",
        "¿Eso fue un ataque? Pensé que estabas acomodando las cartas para la foto.",
        "¡Cuidado con las costuras de mi traje! Me costó una fortuna en la sastrería dimensional.",
        "¿Sabías que somos solo píxeles en la pantalla de alguien? ¡Igual te voy a aplastar!",
        "¡Mira mamá, estoy peleando con cartas de piedra! Espera, ¿dónde está mi espada real?",
        "¡Apuéstame 5 dólares a que mi Reina cura tu depresión antes de destruir tu meta!",
        "¡Toc, toc! ¿Quién es? ¡El tipo que va a reventar tus defensas en tres segundos!"
      ],
      // Level 2: Solar
      [
        "El sol siempre vuelve a levantarse... ¿crees que tú podrás hacer lo mismo?",
        "Mis destellos purificarán tu arrogancia. El fuego solar no conoce piedad.",
        "¿Sientes el calor del tablero? Es tu fin aproximándose grado a grado.",
        "Aquellos que desafían la luz solo encuentran cenizas en su camino.",
        "¡La aurora del mediodía derretirá tus runas! No hay sombra donde esconderse.",
        "El brillo del amanecer corona mi victoria. Ríndete ante el calor celestial.",
        "Cada carta tuya que toco se convierte en humo rúnico."
      ],
      // Level 3: IrwingElSabio
      [
        "La estrategia puede aprenderse en libros... pero la sabiduría rúnica se gana con sangre.",
        "He calculado todos tus movimientos posibles. Ninguno de ellos te salva de la derrota.",
        "Las runas antiguas susurran tu destino... y no es un final feliz para ti.",
        "Cada carta que juegas es un paso más hacia la trampa que diseñé hace siglos.",
        "El conocimiento es el arma definitiva, y tu mazo carece de profundidad.",
        "Aprende de esta lección, joven discípulo: el tablero es mi mente y tú solo un pensamiento.",
        "Un verdadero sabio no teme al descarte; sabe que todo vuelve en el ciclo rúnico."
      ],
      // Level 4: Shinigami
      [
        "Si llegaste hasta aquí... al menos morirás sirviendo de abono para mi jardín de almas.",
        "Tu nombre ya está escrito en mi cuaderno del descarte. Es solo cuestión de tiempo.",
        "¿Escuchas ese frío viento? Es el filo de mi guadaña reclamando tu mazo.",
        "Toda vida es efímera. Tus cartas jugadas pronto me pertenecerán en la pila de descarte.",
        "He cosechado almas más brillantes que la tuya. La tuya será un juego de niños.",
        "La muerte no es injusta... simplemente es puntual. Tu reloj se agota.",
        "El vacío del descarte te llama por tu nombre de pila."
      ],
      // Level 5: Moon
      [
        "Toda partida termina igual... en la completa y absoluta penumbra de la luna nueva.",
        "La noche es mi aliada y tus secretos son visibles bajo mi luz plateada.",
        "Caminas a ciegas en un laberinto de sombras. Yo soy la dueña del laberinto.",
        "El eclipse total de tu esperanza comenzará en tu próximo movimiento.",
        "La marea de mi mazo sube y bajará para ahogar tus débiles tropas.",
        "La fría gravedad lunar aprisionará tu velocidad de avance.",
        "Incluso las estrellas titilan con miedo cuando despliego mis fases ocultas."
      ],
      // Level 6: Katty
      [
        "La sangre de los valientes siempre tiene un sabor tan... dulce y fresco.",
        "Me gusta jugar con mi comida antes de devorarla por completo. ¡Miau!",
        "Tus reflejos son demasiado lentos para mis garras. ¿Te rindes ya?",
        "Arañazo a arañazo, mazo a mazo... voy a desmantelar toda tu defensa.",
        "¡Tengo nueve vidas de ventaja y tú apenas puedes cuidar de una sola!",
        "¡Ronroneas del miedo! Puedo oler el sudor frío de tus cartas numéricas.",
        "Un ratoncito acorralado en la esquina del tablero... qué adorable banquete."
      ],
      // Level 7: King21
      [
        "Yo inventé las reglas de este sagrado altar... ¡ahora intenta sobrevivir a ellas!",
        "¡Silencio ante el Rey! Tu insolencia será castigada con la aniquilación total.",
        "¿Osas desafiar al Dictador Loco? ¡Marcharé con todas mis tropas sobre tu meta!",
        "El número 21 es mi corona. y tu solo eres un humilde peón en mi tablero.",
        "¡Moverse es una orden, no una sugerencia! ¡Marcharéis todos hacia adelante!",
        "¡Mi locura es mi mayor estratega! No puedes predecir lo que ni yo mismo comprendo.",
        "¡El desierto entero temblará cuando el Dictador Loco juegue su mano!"
      ]
    ], []);"""

new_quotes_block = """    const storyGuardians = useMemo(() => [
      { name: "Piscina De La Muerte", title: "El Mercenario Burlón", image: "Piscina De La Muerte.png" },
      { name: "Solar", title: "El Guardián del Sol", image: "Solar.png" },
      { name: "IrwingElSabio", title: "Irwing El Sabio", image: "IrwingElSabio.png" },
      { name: "Shinigami", title: "El Antiguo Dios de la Muerte", image: "Shinigami.png" },
      { name: "Moon", title: "La Princesa Carmesí", image: "Moon.png" },
      { name: "Katty", title: "La Diosa del Conocimiento", image: "Katty.png" },
      { name: "King21", title: "El Dictador Loco", image: "King21.png" },
    ], []);

    const guardianQuotePools = useMemo(() => [
      // Level 1: Piscina De La Muerte
      [
        "¡Oye! ¿Podrías apurarte? Mi chimichanga se está enfriando.",
        "¿Eso fue un ataque? Pensé que estabas acomodando las cartas para la foto.",
        "¡Cuidado con las costuras de mi traje! Me costó una fortuna en la sastrería dimensional.",
        "¿Sabías que somos solo píxeles en la pantalla de alguien? ¡Igual te voy a aplastar!",
        "¡Mira mamá, estoy peleando con cartas de piedra! Espera, ¿dónde está mi espada real?",
        "¡Apuéstame 5 dólares a que mi Reina cura tu depresión antes de destruir tu meta!",
        "¡Toc, toc! ¿Quién es? ¡El tipo que va a reventar tus defensas en tres segundos!",
        "¡Uff, jugar contra ti es más lento que una película de autor francesa!",
        "¡No llores si mi comodín hace desaparecer a tu carta favorita, es solo negocios!",
        "¿Me das tu autógrafo antes de perder? Es para mi colección de 'rivales caídos'."
      ],
      // Level 2: Solar
      [
        "El sol siempre vuelve a levantarse... ¿crees que tú podrás hacer lo mismo?",
        "Mis destellos purificarán tu arrogancia. El fuego solar no conoce piedad.",
        "¿Sientes el calor del tablero? Es tu fin aproximándose grado a grado.",
        "Aquellos que desafían la luz solo encuentran cenizas en su camino.",
        "¡La aurora del mediodía derretirá tus runas! No hay sombra donde esconderse.",
        "El brillo del amanecer corona mi victoria. Ríndete ante el calor celestial.",
        "Cada carta tuya que toco se convierte en humo rúnico.",
        "La luz solar revela todas tus debilidades, no puedes ocultar tu estrategia.",
        "Bajo el sol ardiente, solo los fuertes de espíritu prevalecerán.",
        "¡Siente la gloria del amanecer eterno golpear tu zona de meta!"
      ],
      // Level 3: IrwingElSabio
      [
        "La estrategia puede aprenderse en libros... pero la sabiduría rúnica se gana con sangre.",
        "He calculado todos tus movimientos posibles. Ninguno de ellos te salva de la derrota.",
        "Las runas antiguas susurran tu destino... y no es un final feliz para ti.",
        "Cada carta que juegas es un paso más hacia la trampa que diseñé hace siglos.",
        "El conocimiento es el arma definitiva, y tu mazo carece de profundidad.",
        "Aprende de esta lección, joven discípulo: el tablero es mi mente y tú solo un pensamiento.",
        "Un verdadero sabio no teme al descarte; sabe que todo vuelve en el ciclo rúnico.",
        "Tus impulsos te traicionan, joven estratega. La paciencia es el pilar de la victoria.",
        "Incluso la roca más dura se erosiona ante un río de decisiones inteligentes.",
        "¿Crees en la suerte de las cartas? Yo solo creo en el diseño rúnico de mi mazo."
      ],
      // Level 4: Shinigami
      [
        "Si llegaste hasta aquí... al menos morirás sirviendo de abono para mi jardín de almas.",
        "Tu nombre ya está escrito en mi cuaderno del descarte. Es solo cuestión de tiempo.",
        "¿Escuchas ese frío viento? Es el filo de mi guadaña reclamando tu mazo.",
        "Toda vida es efímera. Tus cartas jugadas pronto me pertenecerán en la pila de descarte.",
        "He cosechado almas más brillantes que la tuya. La tuya será un juego de niños.",
        "La muerte no es injusta... simplemente es puntual. Tu reloj se agota.",
        "El vacío del descarte te llama por tu nombre de pila.",
        "Cada turno que pasa, tu sombra se alarga y tu tiempo en este tablero disminuye.",
        "No llores por tus unidades caídas, todas encontrarán descanso eterno en mi cementerio.",
        "El destino final de todo jugador es rendir sus cartas ante mi presencia."
      ],
      // Level 5: Moon
      [
        "Toda partida termina igual... en la completa y absoluta penumbra de la luna nueva.",
        "La noche es mi aliada y tus secretos son visibles bajo mi luz plateada.",
        "Caminas a ciegas en un laberinto de sombras. Yo soy la dueña del laberinto.",
        "El eclipse total de tu esperanza comenzará en tu próximo movimiento.",
        "La marea de mi mazo sube y bajará para ohogar tus débiles tropas.",
        "La fría gravedad lunar aprisionará tu velocidad de avance.",
        "Incluso las estrellas titilan con miedo cuando despliego mis fases ocultas.",
        "La belleza de la luna carmesí es lo último que verán tus ojos cansados.",
        "Tu luz de esperanza se atenúa... pronto reinará la oscuridad absoluta en tu meta.",
        "Mis cartas danzan al ritmo de la marea lunar, un baile del que no podrás escapar."
      ],
      // Level 6: Katty
      [
        "La sangre de los valientes siempre tiene un sabor tan... dulce y fresco.",
        "Me gusta jugar con mi comida antes de devorarla por completo. ¡Miau!",
        "Tus reflejos son demasiado lentos para mis garras. ¿Te rindes ya?",
        "Arañazo a arañazo, mazo a mazo... voy a desmantelar toda tu defensa.",
        "¡Tengo nueve vidas de ventaja y tú apenas puedes cuidar de una sola!",
        "¡Ronroneas del miedo! Puedo oler el sudor frío de tus cartas numéricas.",
        "Un ratoncito acorralado en la esquina del tablero... qué adorable banquete.",
        "No hay biblioteca en el universo que contenga la estrategia para derrotarme.",
        "El conocimiento absoluto guía mi garra. Sé exactamente qué carta tienes en mano.",
        "¡Qué divertido es ver tus esfuerzos inútiles! Eres como un ovillo de lana en mis manos."
      ],
      // Level 7: King21
      [
        "Yo inventé las reglas de este sagrado altar... ¡ahora intenta sobrevivir a ellas!",
        "¡Silencio ante el Rey! Tu insolencia será castigada con la aniquilación total.",
        "¿Osas desafiar al Dictador Loco? ¡Marcharé con todas mis tropas sobre tu meta!",
        "El número 21 es mi corona. Y tú solo eres un humilde peón en mi tablero.",
        "¡Moverse es una orden, no una sugerencia! ¡Marcharéis todos hacia adelante!",
        "¡Mi locura es mi mayor estratega! No puedes predecir lo que ni yo mismo comprendo.",
        "¡El desierto entero temblará cuando el Dictador Loco juegue su mano!",
        "¡La desobediencia se paga con el descarte! Ningún cobarde permanecerá en mi ejército.",
        "¡Mi trono está hecho con las cenizas del mazo de mis enemigos!",
        "¡El choque de espadas es música para mis oídos reales! ¡Ataquen, mis leales unidades!"
      ]
    ], []);"""

# Part 2: Quote active timer and showStoryBubble state
old_timer_block = """    const [activeGuardianQuote, setActiveGuardianQuote] = useState<string>('');

    useEffect(() => {
        if (state.gameType !== 'adventure' || !state.storyLevel) return;
        const levelIdx = state.storyLevel - 1;
        const pool = guardianQuotePools[levelIdx];
        if (!pool) return;

        const getRandomQuote = () => pool[Math.floor(Math.random() * pool.length)];
        setActiveGuardianQuote(getRandomQuote());

        const interval = setInterval(() => {
            setActiveGuardianQuote(getRandomQuote());
        }, 60000);

        return () => clearInterval(interval);
    }, [state.gameType, state.storyLevel, guardianQuotePools]);"""

new_timer_block = """    const [activeGuardianQuote, setActiveGuardianQuote] = useState<string>('');
    const [showStoryBubble, setShowStoryBubble] = useState<boolean>(false);

    useEffect(() => {
        if (state.gameType !== 'adventure' || !state.storyLevel) return;
        const levelIdx = state.storyLevel - 1;
        const pool = guardianQuotePools[levelIdx];
        if (!pool) return;

        const getRandomQuote = () => pool[Math.floor(Math.random() * pool.length)];
        
        // Show first quote after 3 seconds so the board finishes opening
        const initialTimeout = setTimeout(() => {
            setActiveGuardianQuote(getRandomQuote());
            setShowStoryBubble(true);
        }, 3000);

        const interval = setInterval(() => {
            setActiveGuardianQuote(getRandomQuote());
            setShowStoryBubble(true);
        }, 50000); // 50 seconds

        return () => {
            clearTimeout(initialTimeout);
            clearInterval(interval);
        };
    }, [state.gameType, state.storyLevel, guardianQuotePools]);"""

# Part 3: GameBoard wrapper relative and overlay bubble
old_board_block = """                    {/* Game board takes about 70% of the screen height */}
                    <div className={`flex-grow flex items-center justify-center w-full min-h-0 py-1 md:py-2 ${activeEffect === 'blood' ? 'shake-effect' : ''}`}>
                        <GameBoard 
                          board={board}
                          currentPlayer={currentPlayer}
                          opponentPlayer={opponentPlayer}
                          validMoves={validMoves}
                          showHints={showHints}
                        />
                    </div>"""

new_board_block = """                    {/* Game board takes about 70% of the screen height */}
                    <div className={`flex-grow flex items-center justify-center w-full min-h-0 py-1 md:py-2 ${activeEffect === 'blood' ? 'shake-effect' : ''} relative`}>
                        <GameBoard 
                          board={board}
                          currentPlayer={currentPlayer}
                          opponentPlayer={opponentPlayer}
                          validMoves={validMoves}
                          showHints={showHints}
                        />

                        {/* Story Mode Dialog Bubble Overlay */}
                        {state.gameType === 'adventure' && showStoryBubble && activeGuardianQuote && (
                          <>
                            {/* Fullscreen backdrop to capture screen touches/clicks and dismiss the bubble */}
                            <div 
                              className="fixed inset-0 z-40 bg-black/10 cursor-pointer pointer-events-auto"
                              onClick={() => {
                                audioService.playSFX('click');
                                setShowStoryBubble(false);
                              }}
                            />
                            
                            {/* Comic Speech Bubble */}
                            <div 
                              className="absolute z-50 max-w-[280px] sm:max-w-md bg-[#1d1610]/95 border-2 border-[#D8C49A] p-4 rounded-2xl shadow-[0_15px_30px_rgba(0,0,0,0.95)] flex gap-3.5 items-start cursor-pointer hover:border-white transition-all transform hover:scale-[1.02] pointer-events-auto"
                              onClick={() => {
                                audioService.playSFX('click');
                                setShowStoryBubble(false);
                              }}
                              style={{
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                              }}
                            >
                              <img 
                                src={`/images/history/${storyGuardians[state.storyLevel - 1]?.image || 'IrwingElSabio.png'}`}
                                alt={storyGuardians[state.storyLevel - 1]?.name}
                                className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl border-2 border-[#8A6938] object-cover shrink-0 shadow-md bg-black"
                              />
                              <div className="flex flex-col">
                                <span className="text-[9px] font-orbitron tracking-widest text-[#D8C49A] uppercase leading-none font-bold">
                                  {storyGuardians[state.storyLevel - 1]?.title || 'Enemigo'}
                                </span>
                                <h4 className="text-xs sm:text-sm font-ancient-header text-white font-extrabold tracking-wide mt-1">
                                  {storyGuardians[state.storyLevel - 1]?.name.replace(/([A-Z])/g, ' $1').trim()}
                                </h4>
                                <div className="h-0.5 bg-gradient-to-r from-[#8A6938] to-transparent my-1.5" />
                                <p className="text-xs sm:text-sm text-[#E2C799] italic leading-relaxed font-runic-text">
                                  "{activeGuardianQuote}"
                                </p>
                                <span className="text-[8px] text-[#8A6938] mt-2 self-end animate-pulse uppercase tracking-wider font-extrabold font-orbitron">
                                  ⚡ Toca la pantalla para continuar
                                </span>
                              </div>
                              {/* Speech Bubble Arrow Indicator */}
                              <div className="absolute -bottom-2 left-8 w-4 h-4 bg-[#1d1610] border-r-2 border-b-2 border-[#D8C49A] rotate-45" />
                            </div>
                          </>
                        )}
                    </div>"""

# Part 4: Collapsed draw button block (block when deck is empty)
old_draw_collapsed = """                                                      <button 
                                                         onClick={() => dispatch({ type: 'DRAW_CARD'})} 
                                                         disabled={!canAct} 
                                                         className={`stone-button w-full py-1.5 text-[8px] sm:text-[9px] text-[#1e1a14] ${
                                                           showHints && actionsRemaining > 0 && !selectedCardIdInHand && !selectedUnitIdOnBoard ? 'idle-hint-glow' : ''
                                                         }`}
                                                       >
                                                         Robar ({actionsRemaining})
                                                       </button>"""

new_draw_collapsed = """                                                      <button 
                                                         onClick={() => dispatch({ type: 'DRAW_CARD'})} 
                                                         disabled={!canAct || !currentPlayer || currentPlayer.deck.length === 0} 
                                                         className={`stone-button w-full py-1.5 text-[8px] sm:text-[9px] text-[#1e1a14] ${
                                                           currentPlayer && currentPlayer.deck.length === 0 ? 'bg-red-900/30 text-red-500 border-red-900' : ''
                                                         } ${
                                                           showHints && actionsRemaining > 0 && !selectedCardIdInHand && !selectedUnitIdOnBoard ? 'idle-hint-glow' : ''
                                                         }`}
                                                       >
                                                         {currentPlayer && currentPlayer.deck.length === 0 ? '¡Sin cartas!' : `Robar (${actionsRemaining})`}
                                                       </button>"""

# Part 5: Full action hub draw button block (block when deck is empty)
old_draw_full = """                                <button 
                                   onClick={() => dispatch({ type: 'DRAW_CARD'})} 
                                   disabled={!canAct} 
                                   className={`stone-button w-full py-2.5 text-xs text-[#1e1a14] ${showHints && actionsRemaining > 0 && !selectedCardIdInHand && !selectedUnitIdOnBoard ? 'idle-hint-glow' : ''}`}
                                 >
                                   Robar (1 Act)
                                 </button>"""

new_draw_full = """                                <button 
                                   onClick={() => dispatch({ type: 'DRAW_CARD'})} 
                                   disabled={!canAct || !currentPlayer || currentPlayer.deck.length === 0} 
                                   className={`stone-button w-full py-2.5 text-xs text-[#1e1a14] ${
                                     currentPlayer && currentPlayer.deck.length === 0 ? 'bg-red-900/30 text-red-500 border-red-900' : ''
                                   } ${showHints && actionsRemaining > 0 && !selectedCardIdInHand && !selectedUnitIdOnBoard ? 'idle-hint-glow' : ''}`}
                                 >
                                   {currentPlayer && currentPlayer.deck.length === 0 ? '¡No hay más cartas!' : 'Robar (1 Act)'}
                                 </button>"""

# Helper function to do replacement and check success
def apply_replace(text, old, new, desc):
    if old in text:
        text = text.replace(old, new)
        print(f"[SUCCESS] Applied: {desc}")
    else:
        # Check normalized whitespace
        old_norm = " ".join(old.split())
        text_norm = " ".join(text.split())
        if old_norm in text_norm:
            print(f"[WARN] Found similar match for {desc} with normalized whitespace, doing regex replace.")
            # Build regex matching arbitrary whitespace
            escaped_old = re.escape(old)
            regex_pattern = re.sub(r'\\s+', r'\\s+', escaped_old)
            text, count = re.subn(regex_pattern, new, text)
            if count > 0:
                print(f"[SUCCESS] Applied via regex: {desc}")
            else:
                print(f"[FAIL] Failed to apply: {desc} via regex")
        else:
            print(f"[FAIL] Could not find exact or similar block for: {desc}")
    return text

content = apply_replace(content, old_quotes_block, new_quotes_block, "Quotes block")
content = apply_replace(content, old_timer_block, new_timer_block, "Timer block")
content = apply_replace(content, old_board_block, new_board_block, "Board wrapper and popup")
content = apply_replace(content, old_draw_collapsed, new_draw_collapsed, "Collapsed Draw Button")
content = apply_replace(content, old_draw_full, new_draw_full, "Full Action Hub Draw Button")

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("[INFO] Finished patching.")
