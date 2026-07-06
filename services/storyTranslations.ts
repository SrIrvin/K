export interface StoryLevelTranslation {
  displayName: string;
  subtitle: string;
  description: string;
  quote: string;
  modifiers: string[];
  aiDifficulty: string;
}

export interface StoryUITranslation {
  backBtn: string;
  title: string;
  subtitle: string;
  resetBtn: string;
  resetConfirm: string;
  portalLabel: string;
  targetLabel: string;
  modifiersTitle: string;
  turnLabel: string;
  startBtn: string;
  noSelection: string;
  footer: string;
}

export interface StoryTranslation {
  ui: StoryUITranslation;
  levels: Record<string, StoryLevelTranslation>;
}

export const storyTranslations: Record<string, StoryTranslation> = {
  es: {
    ui: {
      backBtn: "Menú Principal",
      title: "MODO AVENTURA",
      subtitle: "El camino del comandante K",
      resetBtn: "Reiniciar",
      resetConfirm: "¿Seguro que deseas reiniciar tu aventura? Perderás todo tu progreso actual.",
      portalLabel: "Portal de Batalla",
      targetLabel: "Meta",
      modifiersTitle: "Modificadores del Portal",
      turnLabel: "Turno: IA inicia",
      startBtn: "INICIAR DESAFÍO",
      noSelection: "Selecciona un portal de batalla en el mapa para revelar sus secretos.",
      footer: "🔥 COMANDANTE K: DEBES COMPLETAR LOS 7 NIVELES PARA DERROTAR A LOS ANTIGUOS DIOSES 🔥"
    },
    levels: {
      'Piscina De La Muerte': {
        displayName: "Piscina De La Muerte",
        subtitle: "El Mercenario Burlón",
        description: "Un mercenario impredecible que disfruta humillar a sus rivales antes de derrotarlos. Nunca pierde la oportunidad de lanzar una broma o una provocación en medio del combate.",
        quote: "¿Eso fue un ataque? Pensé que estabas acomodando las cartas.",
        modifiers: [
          "2 Tanques enemigos en el tablero (fila de la IA)",
          "Dificultad de la IA: Aprendiz (Fácil)",
          "La IA inicia la partida",
          "Gana quien consiga 3 puntos"
        ],
        aiDifficulty: "Aprendiz (Fácil)"
      },
      'Solar': {
        displayName: "Solar",
        subtitle: "El Guardián del Sol",
        description: "Un viejo guerrero que ha servido durante siglos al Dios de la Luz Solar. Su disciplina es inquebrantable y considera que cada batalla es una prueba del honor de un verdadero comandante.",
        quote: "El sol siempre vuelve a levantarse... ¿podrás hacer lo mismo?",
        modifiers: [
          "3 Unidades enemigas de valor 7 en el tablero",
          "Dificultad de la IA: Aprendiz (Fácil)",
          "La IA inicia la partida",
          "Gana quien consiga 6 puntos"
        ],
        aiDifficulty: "Aprendiz (Fácil)"
      },
      'IrwingElSabio': {
        displayName: "Irwing El Sabio",
        subtitle: "El Orco de las Montañas",
        description: "Un enorme orco conocido por su inteligencia táctica. Vive aislado en las montañas y no siente simpatía por nadie. Habla poco, pero cuando lo hace es letal.",
        quote: "Si llegaste hasta aquí... al menos moriste haciendo ejercicio.",
        modifiers: [
          "3 Unidades rápidas de valor 3 en el tablero",
          "Dificultad de la IA: Aprendiz (Fácil)",
          "La IA inicia la partida",
          "Gana quien consiga 9 puntos"
        ],
        aiDifficulty: "Aprendiz (Fácil)"
      },
      'Shinigami': {
        displayName: "Shinigami",
        subtitle: "El Antiguo Dios de la Muerte",
        description: "Una entidad tan antigua como el tiempo mismo. No pelea por odio ni por gloria; simplemente considera que toda vida termina perteneciendo a su reino.",
        quote: "Toda partida termina igual... solo cambia cuánto tardas en aceptarlo.",
        modifiers: [
          "4 Tanques blindados enemigos bloqueando la fila 1",
          "La IA inicia con un Jack (J) en su mano",
          "Dificultad de la IA: Táctica (Difícil)",
          "La IA inicia la partida",
          "Gana quien consiga 12 puntos"
        ],
        aiDifficulty: "Táctica (Difícil)"
      },
      'Moon': {
        displayName: "Moon",
        subtitle: "La Princesa Carmesí",
        description: "Una princesa de apariencia elegante y oscura que obtiene fuerza de la sangre de sus enemigos. Cada victoria alimenta su poder y disfruta ver desesperarse a sus rivales.",
        quote: "La sangre de los valientes siempre tiene mejor sabor.",
        modifiers: [
          "4 Unidades medias y 1 Tanque enemigo en el tablero",
          "La IA inicia con todos sus Reyes (K) en mano",
          "Dificultad de la IA: Táctica (Difícil)",
          "La IA inicia la partida",
          "Gana quien consiga 15 puntos"
        ],
        aiDifficulty: "Táctica (Difícil)"
      },
      'Katty': {
        displayName: "Katty",
        subtitle: "La Gran Maestra",
        description: "La maestra de todos los dioses y guardiana del conocimiento absoluto. Te tratará como a un niño de cuatro años, con un tono dulce pero sumamente condescendiente, dándote lecciones y corrigiendo tus movimientos mientras juegas.",
        quote: "Oh, qué tierno intento... a ver, te lo explicaré despacio para que puedas entenderlo.",
        modifiers: [
          "Primera línea de 4 unidades rápidas (fila 1)",
          "Segunda línea de 2 unidades medias y 2 tanques (fila 0)",
          "La IA inicia con sus Reinas (Q) en mano",
          "Dificultad de la IA: Táctica (Difícil)",
          "La IA inicia la partida",
          "Gana quien consiga 18 puntos"
        ],
        aiDifficulty: "Táctica (Difícil)"
      },
      'King21': {
        displayName: "King 21",
        subtitle: "El Jerarca Divino",
        description: "El máximo jerarca, descendiente directo de los antiguos dioses. Lejos de estar loco, es una figura de inmenso respeto y sabiduría que protege firmemente a su pueblo, buscando siempre lo mejor para su reino con benevolencia y honor.",
        quote: "Un verdadero líder no busca la guerra, sino el bienestar de su pueblo. Demuestra tu nobleza.",
        modifiers: [
          "Vanguardia enemiga de 4 unidades rápidas (fila 1)",
          "Retaguardia enemiga de 4 tanques con Velocidad 2 (Speed 2!)",
          "La IA inicia con: 1 K, 1 J, 1 Reina y 1 Joker en mano",
          "Dificultad de la IA: Táctica (Difícil)",
          "La IA inicia la partida",
          "Gana quien consiga 21 puntos"
        ],
        aiDifficulty: "Táctica (Difícil)"
      }
    }
  },
  en: {
    ui: {
      backBtn: "Main Menu",
      title: "ADVENTURE MODE",
      subtitle: "The journey of Commander K",
      resetBtn: "Reset",
      resetConfirm: "Are you sure you want to reset your adventure? You will lose all your current progress.",
      portalLabel: "Battle Portal",
      targetLabel: "Goal",
      modifiersTitle: "Portal Modifiers",
      turnLabel: "Turn: AI starts",
      startBtn: "START CHALLENGE",
      noSelection: "Select a battle portal on the map to reveal its secrets.",
      footer: "🔥 COMMANDER K: YOU MUST COMPLETE ALL 7 LEVELS TO DEFEAT THE ANCIENT GODS 🔥"
    },
    levels: {
      'Piscina De La Muerte': {
        displayName: "Death Pool",
        subtitle: "The Mocking Mercenary",
        description: "An unpredictable mercenary who enjoys humiliating his rivals before defeating them. He never misses an opportunity to crack a joke or make a provocation mid-combat.",
        quote: "Was that an attack? I thought you were just organizing your cards.",
        modifiers: [
          "2 enemy Tanks on the board (AI row)",
          "AI Difficulty: Apprentice (Easy)",
          "AI starts the game",
          "First to score 3 points wins"
        ],
        aiDifficulty: "Apprentice (Easy)"
      },
      'Solar': {
        displayName: "Solar",
        subtitle: "The Sun Guardian",
        description: "An ancient warrior who has served the Sun God for centuries. His discipline is unwavering, and he considers every battle a trial of a true commander's honor.",
        quote: "The sun always rises again... can you do the same?",
        modifiers: [
          "3 enemy units of value 7 on the board",
          "AI Difficulty: Apprentice (Easy)",
          "AI starts the game",
          "First to score 6 points wins"
        ],
        aiDifficulty: "Apprentice (Easy)"
      },
      'IrwingElSabio': {
        displayName: "Irwing The Wise",
        subtitle: "The Mountain Orc",
        description: "A massive orc known for his tactical intelligence. He lives isolated in the mountains and feels no sympathy for anyone. He speaks little, but when he does, it is lethal.",
        quote: "If you made it this far... at least you died while exercising.",
        modifiers: [
          "3 fast units of value 3 on the board",
          "AI Difficulty: Apprentice (Easy)",
          "AI starts the game",
          "First to score 9 points wins"
        ],
        aiDifficulty: "Apprentice (Easy)"
      },
      'Shinigami': {
        displayName: "Shinigami",
        subtitle: "The Ancient God of Death",
        description: "An entity as ancient as time itself. He does not fight out of hatred or glory; he simply considers all life destined to belong to his realm.",
        quote: "Every game ends the same way... only how long it takes you to accept it changes.",
        modifiers: [
          "4 armored enemy Tanks blocking row 1",
          "AI starts with a Jack (J) in hand",
          "AI Difficulty: Tactician (Hard)",
          "AI starts the game",
          "First to score 12 points wins"
        ],
        aiDifficulty: "Tactician (Hard)"
      },
      'Moon': {
        displayName: "Moon",
        subtitle: "The Crimson Princess",
        description: "An elegant yet dark princess who draws strength from the blood of her enemies. Every victory feeds her power, and she enjoys seeing her rivals despair.",
        quote: "The blood of the brave always tastes better.",
        modifiers: [
          "4 medium units and 1 enemy Tank on the board",
          "AI starts with all Kings (K) in hand",
          "AI Difficulty: Tactician (Hard)",
          "AI starts the game",
          "First to score 15 points wins"
        ],
        aiDifficulty: "Tactician (Hard)"
      },
      'Katty': {
        displayName: "Katty",
        subtitle: "The Grand Teacher",
        description: "The teacher of all gods and guardian of absolute knowledge. She will treat you like a four-year-old child, in a sweet but highly condescending tone, giving you lessons and correcting your moves as you play.",
        quote: "Oh, what a cute try... let me explain it slowly so you can understand.",
        modifiers: [
          "Front line of 4 fast units (row 1)",
          "Back line of 2 medium units and 2 tanks (row 0)",
          "AI starts with all Queens (Q) in hand",
          "AI Difficulty: Tactician (Hard)",
          "AI starts the game",
          "First to score 18 points wins"
        ],
        aiDifficulty: "Tactician (Hard)"
      },
      'King21': {
        displayName: "King 21",
        subtitle: "The Divine Hierarch",
        description: "The supreme hierarch, direct descendant of the ancient gods. Far from being crazy, he is a figure of immense respect and wisdom who firmly protects his people, always seeking the best for his kingdom with benevolence and honor.",
        quote: "A true leader does not seek war, but the well-being of his people. Prove your nobility.",
        modifiers: [
          "Enemy vanguard of 4 fast units (row 1)",
          "Enemy rearguard of 4 tanks with Speed 2!",
          "AI starts with: 1 K, 1 J, 1 Queen, and 1 Joker in hand",
          "AI Difficulty: Tactician (Hard)",
          "AI starts the game",
          "First to score 21 points wins"
        ],
        aiDifficulty: "Tactician (Hard)"
      }
    }
  },
  zh: {
    ui: {
      backBtn: "返回主菜单",
      title: "冒险模式",
      subtitle: "指挥官 K 的征途",
      resetBtn: "重置",
      resetConfirm: "你确定要重置你的冒险吗？你将失去目前所有的进度。",
      portalLabel: "战役传送门",
      targetLabel: "目标",
      modifiersTitle: "传送门修正值",
      turnLabel: "回合：AI 先手",
      startBtn: "开始挑战",
      noSelection: "在地图上选择一个战役传送门来揭示其秘密。",
      footer: "🔥 指挥官 K：你必须完成所有 7 个关卡才能击败远古众神 🔥"
    },
    levels: {
      'Piscina De La Muerte': {
        displayName: "死侍 (Piscina De La Muerte)",
        subtitle: "嘲讽雇佣兵",
        description: "一个不可预测的雇佣兵，喜欢在击败对手之前羞辱他们。他从不放过在战斗中开玩笑或挑衅的机会。",
        quote: "那是攻击吗？我还以为你只是在整理卡牌呢。",
        modifiers: [
          "棋盘上有 2 辆敌方坦克（AI 行）",
          "AI 难度：学徒（简单）",
          "AI 先手",
          "先得 3 分者获胜"
        ],
        aiDifficulty: "学徒（简单）"
      },
      'Solar': {
        displayName: "索拉 (Solar)",
        subtitle: "太阳守护者",
        description: "一位侍奉太阳神数个世纪的古老战士。他的纪律坚不可摧，他认为每场战斗都是对真正指挥官荣誉的考验。",
        quote: "太阳总会再次升起……你能做到同样的事情吗？",
        modifiers: [
          "棋盘上有 3 个数值为 7 的敌方单位",
          "AI 难度：学徒（简单）",
          "AI 先手",
          "先得 6 分者获胜"
        ],
        aiDifficulty: "学徒（简单）"
      },
      'IrwingElSabio': {
        displayName: "智者欧文 (Irwing El Sabio)",
        subtitle: "山脉兽人",
        description: "一个以战术智慧闻名的巨大兽人。他孤立地生活在山中，对任何人都没有同情心。他话很少，但一旦开口就是致命的。",
        quote: "如果你能走到这一步……至少你是死在运动中的。",
        modifiers: [
          "棋盘上有 3 个数值为 3 的敏捷单位",
          "AI 难度：学徒（简单）",
          "AI 先手",
          "先得 9 分者获胜"
        ],
        aiDifficulty: "学徒（简单）"
      },
      'Shinigami': {
        displayName: "死神 (Shinigami)",
        subtitle: "远古死神",
        description: "一个与时间同等古老的实体。他不为仇恨或荣耀而战；他只是认为所有的生命最终都将属于他的国度。",
        quote: "每场对局的结局都一样……改变的只是你接受它所花的时间。",
        modifiers: [
          "4 辆敌方重装坦克阻挡了第 1 行",
          "AI 手牌中持有一张侍卫 (J) 开始游戏",
          "AI 难度：战术家（困难）",
          "AI 先手",
          "先得 12 分者获胜"
        ],
        aiDifficulty: "战术家（困难）"
      },
      'Moon': {
        displayName: "穆恩 (Moon)",
        subtitle: "绯红公主",
        description: "一位优雅而黑暗的公主，从敌人的血液中汲取力量。每一次胜利都会滋养她的力量，她乐于看到对手绝望。",
        quote: "勇者的鲜血味道总是更好。",
        modifiers: [
          "棋盘上有 4 个中型单位和 1 辆敌方坦克",
          "AI 手牌中持有所有国王 (K) 开始游戏",
          "AI 难度：战术家（困难）",
          "AI 先手",
          "先得 15 分者获胜"
        ],
        aiDifficulty: "战术家（困难）"
      },
      'Katty': {
        displayName: "凯蒂 (Katty)",
        subtitle: "知识女神",
        description: "一位强大的紫色女神。她是众神之师，绝对知识的守护者。每一种战略都曾被她研究过数千次。",
        quote: "战术可以学习……但智慧必须去争取。",
        modifiers: [
          "第一排为 4 个敏捷单位（第 1 行）",
          "第二排为 2 个中型单位和 2 辆坦克（第 0 行）",
          "AI 手牌中持有所有王后 (Q) 开始游戏",
          "AI 难度：战术家（困难）",
          "AI 先手",
          "先得 18 分者获胜"
        ],
        aiDifficulty: "战术家（困难）"
      },
      'King21': {
        displayName: "国王 21 (King 21)",
        subtitle: "至高无上的国王",
        description: "游戏的创造者。战略之神，绝对的王者和最后的对手。他不寻求证明自己的力量；他只想看看是否终于有人能够击败他。",
        quote: "规则是我发明的……现在尝试用规则来击败我吧。",
        modifiers: [
          "敌方前锋为 4 个敏捷单位（第 1 行）",
          "敌方后卫为 4 辆速度为 2 的坦克！",
          "AI 起手持有：1张K，1张J，1张Q和1张Joker",
          "AI 难度：战术家（困难）",
          "AI 先手",
          "先得 21 分者获胜"
        ],
        aiDifficulty: "战术家（困难）"
      }
    }
  },
  fr: {
    ui: {
      backBtn: "Menu Principal",
      title: "MODE AVENTURE",
      subtitle: "Le chemin du commandant K",
      resetBtn: "Réinitialiser",
      resetConfirm: "Êtes-vous sûr de vouloir réinitialiser votre aventure ? Vous perdrez toute votre progression actuelle.",
      portalLabel: "Portail de Bataille",
      targetLabel: "Objectif",
      modifiersTitle: "Modificateurs du Portail",
      turnLabel: "Tour : l'IA commence",
      startBtn: "COMMENCER LE DÉFI",
      noSelection: "Sélectionnez un portail de bataille sur la carte pour révéler ses secrets.",
      footer: "🔥 COMMANDANT K : VOUS DEVEZ COMPLÉTER LES 7 NIVEAUX POUR VAINCRE LES ANCIENS DIEUX 🔥"
    },
    levels: {
      'Piscina De La Muerte': {
        displayName: "Piscina De La Muerte",
        subtitle: "Le Mercenaire Moqueur",
        description: "Un mercenaire imprévisible qui aime humilier ses rivaux avant de les vaincre. Il ne rate jamais une occasion de lancer une blague ou une provocation au milieu du combat.",
        quote: "C'était une attaque ? Je pensais que tu rangeais tes cartes.",
        modifiers: [
          "2 Chars ennemis sur le plateau (rangée de l'IA)",
          "Difficulté IA : Apprenti (Facile)",
          "L'IA commence la partie",
          "Le premier à marquer 3 points gagne"
        ],
        aiDifficulty: "Apprenti (Facile)"
      },
      'Solar': {
        displayName: "Solar",
        subtitle: "Le Gardien du Soleil",
        description: "Un vieux guerrier qui a servi le dieu du soleil pendant des siècles. Sa discipline est inébranlable et il considère chaque combat comme une épreuve pour l'honneur d'un commandant.",
        quote: "Le soleil se lève toujours à nouveau... pouvez-vous faire de même ?",
        modifiers: [
          "3 Unités ennemies de valeur 7 sur le plateau",
          "Difficulté IA : Apprenti (Facile)",
          "L'IA commence la partie",
          "Le premier à marquer 6 points gagne"
        ],
        aiDifficulty: "Apprenti (Facile)"
      },
      'IrwingElSabio': {
        displayName: "Irwing le Sage",
        subtitle: "L'Orque des Montagnes",
        description: "Un énorme orque connu pour son intelligence tactique. Il vit isolé dans les montagnes et n'a de sympathie pour personne. Il parle peu, mais quand il le fait, c'est mortel.",
        quote: "Si tu es arrivé jusqu'ici... au moins tu es mort en faisant du sport.",
        modifiers: [
          "3 Unités rapides de valeur 3 sur le plateau",
          "Difficulté IA : Apprenti (Facile)",
          "L'IA commence la partie",
          "Le premier à marquer 9 points gagne"
        ],
        aiDifficulty: "Apprenti (Facile)"
      },
      'Shinigami': {
        displayName: "Shinigami",
        subtitle: "L'Ancien Dieu de la Mort",
        description: "Une entité aussi ancienne que le temps lui-même. Il ne se bat pas par haine ou pour la gloire ; il considère simplement que toute vie finit par appartenir à son royaume.",
        quote: "Chaque partie se termine de la même façon... seul le temps que tu mets à l'accepter change.",
        modifiers: [
          "4 Chars ennemis blindés bloquant la rangée 1",
          "L'IA commence avec un Valet (J) en main",
          "Difficulté IA : Tactique (Difficile)",
          "L'IA commence la partie",
          "Le premier à marquer 12 points gagne"
        ],
        aiDifficulty: "Tactique (Difficile)"
      },
      'Moon': {
        displayName: "Moon",
        subtitle: "La Princesse Cramoisie",
        description: "Une princesse à l'apparence élégante et sombre qui puise sa force dans le sang de ses ennemis. Chaque victoire nourrit son pouvoir et elle aime voir ses rivaux désespérer.",
        quote: "Le sang des braves a toujours meilleur goût.",
        modifiers: [
          "4 Unités moyennes et 1 Char ennemi sur le plateau",
          "L'IA commence avec tous ses Rois (K) en main",
          "Difficulté IA : Tactique (Difficile)",
          "L'IA commence la partie",
          "Le premier à marquer 15 points gagne"
        ],
        aiDifficulty: "Tactique (Difficile)"
      },
      'Katty': {
        displayName: "Katty",
        subtitle: "La Déesse de la Connaissance",
        description: "Une puissante déesse violette. C'est la maîtresse de tous les dieux et la gardienne du savoir absolu. Chaque stratégie a été étudiée par elle des milliers de fois.",
        quote: "La stratégie s'apprend... mais la sagesse doit se mériter.",
        modifiers: [
          "Première ligne de 4 unités rapides (rangée 1)",
          "Deuxième ligne de 2 unités moyennes et 2 chars (rangée 0)",
          "L'IA commence avec ses Reines (Q) en main",
          "Difficulté IA : Tactique (Difficile)",
          "L'IA commence la partie",
          "Le premier à marquer 18 points gagne"
        ],
        aiDifficulty: "Tactique (Difficile)"
      },
      'King21': {
        displayName: "King 21",
        subtitle: "Le Roi Suprême",
        description: "Le créateur du jeu. Dieu de la stratégie, le roi absolu et l'ultime rival. Il ne cherche pas à prouver sa puissance ; il veut juste voir s'il y a enfin quelqu'un capable de le vaincre.",
        quote: "J'ai inventé les règles... maintenant essaie de me battre avec.",
        modifiers: [
          "Avant-garde ennemie de 4 unités rapides (rangée 1)",
          "Arrière-garde ennemie de 4 chars de vitesse 2 !",
          "L'IA commence avec : 1 K, 1 J, 1 Reine et 1 Joker en main",
          "Difficulté IA : Tactique (Difficile)",
          "L'IA commence la partie",
          "Le premier à marquer 21 points gagne"
        ],
        aiDifficulty: "Tactique (Difficile)"
      }
    }
  },
  it: {
    ui: {
      backBtn: "Menu Principale",
      title: "MODALITÀ AVVENTURA",
      subtitle: "Il cammino del comandante K",
      resetBtn: "Azzera",
      resetConfirm: "Sei sicuro di voler resettare la tua avventura? Perderai tutti i progressi attuali.",
      portalLabel: "Portale di Battaglia",
      targetLabel: "Meta",
      modifiersTitle: "Modificatori del Portale",
      turnLabel: "Turno: inizia l'IA",
      startBtn: "INIZIA SFIDA",
      noSelection: "Seleziona un portale di battaglia sulla mappa per svelare i suoi segreti.",
      footer: "🔥 COMANDANTE K: DEVI COMPLETARE TUTTI E 7 I LIVELLI PER SCONFIGGERE GLI ANTICH DEI 🔥"
    },
    levels: {
      'Piscina De La Muerte': {
        displayName: "Piscina De La Muerte",
        subtitle: "Il Mercenario Beffardo",
        description: "Un mercenario imprevedibile che si diverte a umiliare i rivali prima di sconfiggerli. Non perde mai l'occasione di fare una battuta o una provocazione a metà combattimento.",
        quote: "Quello era un attacco? Pensavo stessi solo riordinando le carte.",
        modifiers: [
          "2 Carri armati nemici sul tabellone (riga IA)",
          "Difficoltà IA: Apprendista (Facile)",
          "L'IA inizia la partita",
          "Vince chi ottiene prima 3 punti"
        ],
        aiDifficulty: "Apprendista (Facile)"
      },
      'Solar': {
        displayName: "Solar",
        subtitle: "Il Custode del Sole",
        description: "Un vecchio guerriero che ha servito il Dio del Sole per secoli. La sua disciplina è incrollabile e considera ogni battaglia come una prova dell'onore di un comandante.",
        quote: "Il sole sorge sempre di nuovo... sarai in grado di fare lo stesso?",
        modifiers: [
          "3 Unità nemiche con valore 7 sul tabellone",
          "Difficoltà IA: Apprendista (Facile)",
          "L'IA inizia la partita",
          "Vince chi ottiene prima 6 punti"
        ],
        aiDifficulty: "Apprendista (Facile)"
      },
      'IrwingElSabio': {
        displayName: "Irwing il Saggio",
        subtitle: "L'Orco delle Montagne",
        description: "Un enorme orco noto per la sua intelligenza tattica. Vive isolato tra le montagne e non prova simpatia per nessuno. Parla poco, ma quando lo fa è letale.",
        quote: "Se sei arrivato fin qui... almeno sei morto facendo esercizio.",
        modifiers: [
          "3 Unità veloci con valore 3 sul tabellone",
          "Difficoltà IA: Apprendista (Facile)",
          "L'IA inizia la partita",
          "Vince chi ottiene prima 9 punti"
        ],
        aiDifficulty: "Apprendista (Facile)"
      },
      'Shinigami': {
        displayName: "Shinigami",
        subtitle: "L'Antico Dio della Morte",
        description: "Un'entità antica quanto il tempo stesso. Non combatte per odio o per gloria; ritiene semplicemente che ogni vita finisca per appartenere al suo regno.",
        quote: "Ogni partita finisce nello stesso modo... cambia solo quanto ci metti ad accettarlo.",
        modifiers: [
          "4 Carri armati nemici corazzati che bloccano la riga 1",
          "L'IA inizia con un Fante (J) in mano",
          "Difficoltà IA: Tattica (Difficile)",
          "L'IA inizia la partita",
          "Vince chi ottiene prima 12 punti"
        ],
        aiDifficulty: "Tattica (Difficile)"
      },
      'Moon': {
        displayName: "Moon",
        subtitle: "La Principessa Cremisi",
        description: "Una principessa dall'aspetto elegante e oscuro che trae forza dal sangue dei suoi nemici. Ogni vittoria alimenta il suo potere e le piace vedere i rivali disperarsi.",
        quote: "Il sangue dei coraggiosi ha sempre un sapore migliore.",
        modifiers: [
          "4 Unità medie e 1 Carro armato nemico sul tabellone",
          "L'IA inizia con tutti i Re (K) in mano",
          "Difficoltà IA: Tattica (Difficile)",
          "L'IA inizia la partita",
          "Vince chi ottiene prima 15 punti"
        ],
        aiDifficulty: "Tattica (Difficile)"
      },
      'Katty': {
        displayName: "Katty",
        subtitle: "La Dea della Conoscenza",
        description: "Una potente dea di colore viola. È la maestra di tutti gli dei e la custode della conoscenza assoluta. Ogni strategia è stata da lei studiata migliaia di volte.",
        quote: "La strategia si può imparare... ma la saggezza va meritata.",
        modifiers: [
          "Prima linea di 4 unità veloci (riga 1)",
          "Seconda linea di 2 unità medie e 2 carri armati (riga 0)",
          "L'IA inizia con le Regine (Q) in mano",
          "Difficoltà IA: Tattica (Difficile)",
          "L'IA inizia la partita",
          "Vince chi ottiene prima 18 punti"
        ],
        aiDifficulty: "Tattica (Difficile)"
      },
      'King21': {
        displayName: "King 21",
        subtitle: "Il Re Supremo",
        description: "Il creatore del gioco. Dio della strategia, il re assoluto e l'ultimo rivale. Non cerca di dimostrare di essere potente; vuole solo vedere se c'è finalmente qualcuno in grado di sconfiggerlo.",
        quote: "Ho inventato io le regole... ora prova a battermi con esse.",
        modifiers: [
          "Avanguardia nemica di 4 unità veloci (riga 1)",
          "Retroguardia nemica di 4 carri armati con Velocità 2!",
          "L'IA inizia con: 1 K, 1 J, 1 Regina e 1 Joker in mano",
          "Difficoltà IA: Tattica (Difficile)",
          "L'IA inizia la partita",
          "Vince chi ottiene prima 21 punti"
        ],
        aiDifficulty: "Tattica (Difficile)"
      }
    }
  },
  pt: {
    ui: {
      backBtn: "Menu Principal",
      title: "MODO AVENTURA",
      subtitle: "O caminho do comandante K",
      resetBtn: "Reiniciar",
      resetConfirm: "Tem certeza de que deseja reiniciar sua aventura? Você perderá todo o progresso atual.",
      portalLabel: "Portal de Batalha",
      targetLabel: "Meta",
      modifiersTitle: "Modificadores do Portal",
      turnLabel: "Turno: IA inicia",
      startBtn: "INICIAR DESAFIO",
      noSelection: "Selecione um portal de batalha no mapa para revelar seus segredos.",
      footer: "🔥 COMANDANTE K: VOCÊ DEVE COMPLETAR OS 7 NÍVEIS PARA DERROTAR OS ANTIGOS DEUSES 🔥"
    },
    levels: {
      'Piscina De La Muerte': {
        displayName: "Piscina De La Muerte",
        subtitle: "O Mercenário Debochado",
        description: "Um mercenário imprevisível que gosta de humilhar seus rivais antes de derrotá-los. Nunca perde a oportunidade de fazer uma piada ou provocação no meio do combate.",
        quote: "Isso foi um ataque? Pensei que você estava apenas organizando as cartas.",
        modifiers: [
          "2 Tanques inimigos no tabuleiro (linha da IA)",
          "Dificuldade da IA: Aprendiz (Fácil)",
          "A IA inicia a partida",
          "Vence quem marcar 3 pontos primeiro"
        ],
        aiDifficulty: "Aprendiz (Fácil)"
      },
      'Solar': {
        displayName: "Solar",
        subtitle: "O Guardião do Sol",
        description: "Um velho guerreiro que tem servido o Deus do Sol por séculos. Sua disciplina é inabalável e ele considera cada batalha como um teste de honra de um verdadeiro comandante.",
        quote: "O sol sempre nasce de novo... você será capaz de fazer o mesmo?",
        modifiers: [
          "3 Unidades inimigas de valor 7 no tabuleiro",
          "Dificuldade da IA: Aprendiz (Fácil)",
          "A IA inicia a partida",
          "Vence quem marcar 6 pontos primeiro"
        ],
        aiDifficulty: "Aprendiz (Fácil)"
      },
      'IrwingElSabio': {
        displayName: "Irwing o Sábio",
        subtitle: "O Orc das Montanhas",
        description: "Um enorme orc conhecido por sua inteligência tática. Ele vive isolado nas montanhas e não tem simpatia por ninguém. Fala pouco, mas quando o faz, é letal.",
        quote: "Se você chegou até aqui... pelo menos morreu fazendo exercício.",
        modifiers: [
          "3 Unidades rápidas de valor 3 no tabuleiro",
          "Dificuldade da IA: Aprendiz (Fácil)",
          "A IA inicia a partida",
          "Vence quem marcar 9 pontos primeiro"
        ],
        aiDifficulty: "Aprendiz (Fácil)"
      },
      'Shinigami': {
        displayName: "Shinigami",
        subtitle: "O Antigo Deus da Morte",
        description: "Uma entidade tão antiga quanto o próprio tempo. Ele não luta por ódio ou por glória; simplesmente considera que toda vida termina pertencendo ao seu reino.",
        quote: "Toda partida termina da mesma forma... só muda quanto tempo você leva para aceitar.",
        modifiers: [
          "4 Tanques inimigos blindados bloqueando a linha 1",
          "A IA inicia com um Valete (J) na mão",
          "Dificuldade da IA: Tático (Difícil)",
          "A IA inicia a partida",
          "Vence quem marcar 12 pontos primeiro"
        ],
        aiDifficulty: "Tático (Difícil)"
      },
      'Moon': {
        displayName: "Moon",
        subtitle: "A Princesa Carmesim",
        description: "Uma princesa de aparência elegante e escura que obtém força do sangue de seus inimigos. Cada vitória alimenta seu poder e ela gosta de ver seus rivais em desespero.",
        quote: "O sangue dos bravos sempre tem melhor sabor.",
        modifiers: [
          "4 Unidades médias e 1 Tanque inimigo no tabuleiro",
          "A IA inicia com todos os Reis (K) na mão",
          "Dificuldade da IA: Tático (Difícil)",
          "A IA inicia a partida",
          "Vence quem marcar 15 pontos primeiro"
        ],
        aiDifficulty: "Tático (Difícil)"
      },
      'Katty': {
        displayName: "Katty",
        subtitle: "A Deusa do Conhecimento",
        description: "Uma poderosa deusa roxa. Ela é a mestra de todos os deuses e guardiã do conhecimento absoluto. Cada estratégia foi estudada por ela milhares de vezes.",
        quote: "Estratégia pode ser aprendida... mas sabedoria deve ser conquistada.",
        modifiers: [
          "Primeira linha de 4 unidades rápidas (linha 1)",
          "Segunda linha de 2 unidades médias e 2 tanques (linha 0)",
          "A IA inicia com suas Rainhas (Q) na mão",
          "Dificuldade da IA: Tático (Difícil)",
          "A IA inicia a partida",
          "Vence quem marcar 18 pontos primeiro"
        ],
        aiDifficulty: "Tático (Difícil)"
      },
      'King21': {
        displayName: "King 21",
        subtitle: "O Rei Supremo",
        description: "O criador do jogo. Deus da estratégia, o rei absoluto e último rival. Não busca provar que é poderoso; apenas quer ver se finalmente há alguém capaz de derrotá-lo.",
        quote: "Eu inventei as regras... agora tente me vencer com elas.",
        modifiers: [
          "Vanguarda inimiga de 4 unidades rápidas (linha 1)",
          "Retaguarda inimiga de 4 tanques com Velocidade 2!",
          "A IA inicia com: 1 K, 1 J, 1 Rainha e 1 Joker na mão",
          "Dificuldade da IA: Tático (Difícil)",
          "A IA inicia a partida",
          "Vence quem marcar 21 pontos primeiro"
        ],
        aiDifficulty: "Tático (Difícil)"
      }
    }
  },
  ru: {
    ui: {
      backBtn: "Главное меню",
      title: "РЕЖИМ ПРИКЛЮЧЕНИЙ",
      subtitle: "Путь командира K",
      resetBtn: "Сбросить",
      resetConfirm: "Вы уверены, что хотите сбросить свой прогресс? Вы потеряете все текущие достижения.",
      portalLabel: "Портал битвы",
      targetLabel: "Цель",
      modifiersTitle: "Модификаторы портала",
      turnLabel: "Ход: ИИ начинает",
      startBtn: "НАЧАТЬ ИСПЫТАНИЕ",
      noSelection: "Выберите портал битвы на карте, чтобы раскрыть его секреты.",
      footer: "🔥 КОМАНДИР K: ВЫ ДОЛЖНЫ ПРОЙТИ ВСЕ 7 УРОВНЕЙ, ЧТОБЫ ПОБЕДИТЬ ДРЕВНИХ БОГОВ 🔥"
    },
    levels: {
      'Piscina De La Muerte': {
        displayName: "Дэдпул (Piscina De La Muerte)",
        subtitle: "Насмешливый наемник",
        description: "Непредсказуемый наемник, которому нравится унижать своих соперников перед тем, как победить их. Он никогда не упускает возможности пошутить или спровоцировать посреди боя.",
        quote: "Это была атака? Я думал, ты просто раскладываешь карты.",
        modifiers: [
          "2 вражеских танка на поле (ряд ИИ)",
          "Сложность ИИ: Ученик (Легко)",
          "ИИ начинает игру",
          "Побеждает тот, кто первым наберет 3 очка"
        ],
        aiDifficulty: "Ученик (Легко)"
      },
      'Solar': {
        displayName: "Солар (Solar)",
        subtitle: "Хранитель Солнца",
        description: "Старый воин, веками служивший Богу Солнечного Света. Его дисциплина непоколебима, и он считает каждую битву испытанием чести истинного командира.",
        quote: "Солнце всегда встает снова... сможешь ли ты сделать то же самое?",
        modifiers: [
          "3 вражеских юнита со значением 7 на поле",
          "Сложность ИИ: Ученик (Легко)",
          "ИИ начинает игру",
          "Побеждает тот, кто первым наберет 6 очков"
        ],
        aiDifficulty: "Ученик (Легко)"
      },
      'IrwingElSabio': {
        displayName: "Ирвинг Мудрый (Irwing El Sabio)",
        subtitle: "Горный Орк",
        description: "Огромный орк, известный своим тактическим мышлением. Он живет уединенно в горах и никому не сочувствует. Говорит мало, но когда говорит — это смертельно.",
        quote: "Если уж дошел сюда... по крайней мере, умер, занимаясь спортом.",
        modifiers: [
          "3 быстрых юнита со значением 3 на поле",
          "Сложность ИИ: Ученик (Легко)",
          "ИИ начинает игру",
          "Побеждает тот, кто первым наберет 9 очков"
        ],
        aiDifficulty: "Ученик (Легко)"
      },
      'Shinigami': {
        displayName: "Синигами (Shinigami)",
        subtitle: "Древний Бог Смерти",
        description: "Существо столь же древнее, как само время. Он сражается не из-за ненависти или славы; он просто считает, что вся жизнь в итоге принадлежит его царству.",
        quote: "Каждая партия заканчивается одинаково... меняется только то, как быстро ты это примешь.",
        modifiers: [
          "4 бронированных вражеских танка блокируют ряд 1",
          "ИИ начинает игру с Валетом (J) в руке",
          "Сложность ИИ: Тактик (Сложно)",
          "ИИ начинает игру",
          "Побеждает тот, кто первым наберет 12 очков"
        ],
        aiDifficulty: "Тактик (Сложно)"
      },
      'Moon': {
        displayName: "Мун (Moon)",
        subtitle: "Багряная Принцесса",
        description: "Элегантная, но темная принцесса, черпающая силу в крови своих врагов. Каждая победа питает ее могущество, и ей нравится видеть отчаяние соперников.",
        quote: "Кровь храбрецов всегда вкуснее.",
        modifiers: [
          "4 средних юнита и 1 вражеский танк на поле",
          "ИИ начинает со всеми Королями (K) в руке",
          "Сложность ИИ: Тактик (Сложно)",
          "ИИ начинает игру",
          "Побеждает тот, кто первым наберет 15 очков"
        ],
        aiDifficulty: "Тактик (Сложно)"
      },
      'Katty': {
        displayName: "Кэтти (Katty)",
        subtitle: "Богиня Знаний",
        description: "Могущественная фиолетовая богиня. Она наставница всех богов и хранительница абсолютного знания. Каждая стратегия изучалась ею тысячи раз.",
        quote: "Стратегии можно научиться... но мудрость нужно заслужить.",
        modifiers: [
          "Первая линия из 4 быстрых юнитов (ряд 1)",
          "Вторая линия из 2 средних юнитов и 2 танков (ряд 0)",
          "ИИ начинает со всеми Дамами (Q) в руке",
          "Сложность ИИ: Тактик (Сложно)",
          "ИИ начинает игру",
          "Побеждает тот, кто первым наберет 18 очков"
        ],
        aiDifficulty: "Тактик (Сложно)"
      },
      'King21': {
        displayName: "Король 21 (King 21)",
        subtitle: "Верховный Король",
        description: "Создатель игры. Бог стратегии, абсолютный правитель и финальный соперник. Он не стремится доказать свое могущество; он просто хочет узнать, найдется ли наконец тот, кто сможет победить его.",
        quote: "Я придумал правила... теперь попробуй победить меня по ним.",
        modifiers: [
          "Вражеский авангард из 4 быстрых юнитов (ряд 1)",
          "Вражеский арьергард из 4 танков со Скоростью 2!",
          "ИИ начинает с: 1 K, 1 J, 1 Дамой и 1 Джокером в руке",
          "Сложность ИИ: Тактик (Сложно)",
          "ИИ начинает игру",
          "Побеждает тот, кто первым наберет 21 очко"
        ],
        aiDifficulty: "Тактик (Сложно)"
      }
    }
  },
  ar: {
    ui: {
      backBtn: "القائمة الرئيسية",
      title: "وضع المغامرة",
      subtitle: "طريق القائد K",
      resetBtn: "إعادة ضبط",
      resetConfirm: "هل أنت متأكد من أنك تريد إعادة تعيين مغامرتك؟ ستفقد كل تقدمك الحالي.",
      portalLabel: "بوابة المعركة",
      targetLabel: "الهدف",
      modifiersTitle: "تعديلات البوابة",
      turnLabel: "الدور: يبدأ الذكاء الاصطناعي",
      startBtn: "بدء التحدي",
      noSelection: "اختر بوابة معركة على الخريطة لتكشف عن أسرارها.",
      footer: "🔥 القائد K: يجب إكمال جميع المستويات السبعة لهزيمة الآلهة القدامى 🔥"
    },
    levels: {
      'Piscina De La Muerte': {
        displayName: "مسبح الموت (Piscina De La Muerte)",
        subtitle: "المرتزق المستهزئ",
        description: "مرتزق لا يمكن التنبؤ بتصرفاته يستمتع بإذلال منافسيه قبل هزيمتهم. لا يفوت أبدًا فرصة إلقاء نكتة أو استفزاز في منتصف المعركة.",
        quote: "هل كان ذلك هجومًا؟ ظننتك ترتب أوراقك فقط.",
        modifiers: [
          "دبابتان للعدو على اللوحة (صف الذكاء الاصطناعي)",
          "صعوبة الذكاء الاصطناعي: مبتدئ (سهل)",
          "الذكاء الاصطناعي يبدأ اللعبة",
          "يفوز من يحصل على 3 نقاط أولاً"
        ],
        aiDifficulty: "مبتدئ (سهل)"
      },
      'Solar': {
        displayName: "سولار (Solar)",
        subtitle: "حارس الشمس",
        description: "محارب قديم خدم إله ضوء الشمس لقرون. انضباطه لا يتزعزع ويعتبر كل معركة بمثابة اختبار لشرف القائد الحقيقي.",
        quote: "تشرق الشمس دائمًا من جديد... فهل يمكنك فعل الشيء نفسه؟",
        modifiers: [
          "3 وحدات معادية بقيمة 7 على اللوحة",
          "صعوبة الذكاء الاصطناعي: مبتدئ (سهل)",
          "الذكاء الاصطناعي يبدأ اللعبة",
          "يفوز من يحصل على 6 نقاط أولاً"
        ],
        aiDifficulty: "مبتدئ (سهل)"
      },
      'IrwingElSabio': {
        displayName: "إيروينج الحكيم (Irwing El Sabio)",
        subtitle: "أورق الجبال",
        description: "أورق ضخم معروف بذكائه التكتيكي. يعيش معزولاً في الجبال ولا يشعر بالتعاطف مع أحد. يتكلم قليلاً، ولكن عندما يفعل، فإنه مميت.",
        quote: "إذا وصلت إلى هنا... على الأقل مت وأنت تمارس الرياضة.",
        modifiers: [
          "3 وحدات سريعة بقيمة 3 على اللوحة",
          "صعوبة الذكاء الاصطناعي: مبتدئ (سهل)",
          "الذكاء الاصطناعي يبدأ اللعبة",
          "يفوز من يحصل على 9 نقاط أولاً"
        ],
        aiDifficulty: "مبتدئ (سهل)"
      },
      'Shinigami': {
        displayName: "شينيغامي (Shinigami)",
        subtitle: "إله الموت القديم",
        description: "كيان قديم قدم الوقت نفسه. لا يقاتل من أجل الكراهية أو المجد؛ بل يعتبر ببساطة أن كل حياة تنتهي بالانتماء إلى ملكوته.",
        quote: "كل لعبة تنتهي بالطريقة نفسها... فقط يتغير مدى الوقت الذي تستغرقه لقبول ذلك.",
        modifiers: [
          "4 دبابات معادية مدرعة تسد الصف 1",
          "يبدأ الذكاء الاصطناعي ببطاقة فتى (J) في يده",
          "صعوبة الذكاء الاصطناعي: تكتيكي (صعب)",
          "الذكاء الاصطناعي يبدأ اللعبة",
          "يفوز من يحصل على 12 نقطة أولاً"
        ],
        aiDifficulty: "تكتيكي (صعب)"
      },
      'Moon': {
        displayName: "مون (Moon)",
        subtitle: "الأميرة القرمزية",
        description: "أميرة ذات مظهر أنيق ومظلم تستمد قوتها من دماء أعدائها. كل نصر يغذي قوتها وتستمتع برؤية منافسيها ييأسون.",
        quote: "دماء الشجعان طعمها أفضل دائمًا.",
        modifiers: [
          "4 وحدات متوسطة ودبابة واحدة معادية على اللوحة",
          "يبدأ الذكاء الاصطناعي بكل ملوكه (K) في يده",
          "صعوبة الذكاء الاصطناعي: تكتيكي (صعب)",
          "الذكاء الاصطناعي يبدأ اللعبة",
          "يفوز من يحصل على 15 نقطة أولاً"
        ],
        aiDifficulty: "تكتيكي (صعب)"
      },
      'Katty': {
        displayName: "كاتي (Katty)",
        subtitle: "إلهة المعرفة",
        description: "إلهة أرجوانية قوية. هي معلمة كل الآلهة وحارسة المعرفة المطلقة. درست كل استراتيجية آلاف المرات.",
        quote: "يمكن تعلم الاستراتيجية... ولكن يجب اكتساب الحكمة.",
        modifiers: [
          "الخط الأمامي المكون من 4 وحدات سريعة (الصف 1)",
          "الخط الخلفي المكون من وحدتين متوسطتين ودبابتين (الصف 0)",
          "يبدأ الذكاء الاصطناعي بكل ملكاته (Q) في يده",
          "صعوبة الذكاء الاصطناعي: تكتيكي (صعب)",
          "الذكاء الاصطناعي يبدأ اللعبة",
          "يفوز من يحصل على 18 نقطة أولاً"
        ],
        aiDifficulty: "تكتيكي (صعب)"
      },
      'King21': {
        displayName: "الملك 21 (King 21)",
        subtitle: "الملك الأعلى",
        description: "مبتكر اللعبة. إله الاستراتيجية، الملك المطلق والمنافس الأخير. لا يسعى لإثبات قوته؛ يريد فقط معرفة ما إذا كان هناك أخيرًا شخص قادر على هزيمته.",
        quote: "أنا من ابتكرت القواعد... حاول الآن التغلب علي بها.",
        modifiers: [
          "طليعة العدو المكونة من 4 وحدات سريعة (الصف 1)",
          "مؤخرة العدو المكونة من 4 دبابات بسرعة 2!",
          "يبدأ الذكاء الاصطناعي وبيده: 1 K و 1 J وملكة واحدة وجوكر واحد",
          "صعوبة الذكاء الاصطناعي: تكتيكي (صعب)",
          "الذكاء الاصطناعي يبدأ اللعبة",
          "يفوز من يحصل على 21 نقطة أولاً"
        ],
        aiDifficulty: "تكتيكي (صعب)"
      }
    }
  },
  nah: {
    ui: {
      backBtn: "Yancuic Tlapechtli",
      title: "YAOTLACUILOLLI MODO",
      subtitle: "Commander K otli",
      resetBtn: "Yancuic Nehnemiliztli",
      resetConfirm: "¿Tlen nelli ticnequi ticyancuilia moyaotlacuilolli? Ticyehyeloz mochi motonal.",
      portalLabel: "Yaoyotl Caltepoztli",
      targetLabel: "Tonalpan",
      modifiersTitle: "Tlayectlaliliztli Caltepoztli",
      turnLabel: "Tonalyaotl: IA pehua",
      startBtn: "PEHUA YAOYOTL",
      noSelection: "Tlapoxtia ce caltepoztli ipan amatl inic ticttaz itenyo.",
      footer: "🔥 COMMANDER K: TIMOMACHTIZ CEHCEPA 7 CALTEPOZTLI INIC TICTLAHTLALIZ HUEHUETLAHTOLTI 🔥"
    },
    levels: {
      'Piscina De La Muerte': {
        displayName: "Miquiztlan",
        subtitle: "Tetech-ahuiani Yaotl",
        description: "Ce yaotl tlein ahmo cualli tlamati ihuan cehcehualtia iyauh. Ahmo quipoloa tonalli inic tlapinauhtia tepalcatl.",
        quote: "¿Tlein inon yaoyotl? Nicnemilia zan tictlalilia motepalcatl.",
        modifiers: [
          "2 Tepozmalacatl ipan tlapechtli (IA)",
          "Chicoahualiztli IA: Yamanqui (Easy)",
          "IA pehua yaoyotl",
          "Tlatlaniz tlein quichihua 3 tlamahuichihualiztli"
        ],
        aiDifficulty: "Momachtiani (Yamanqui)"
      },
      'Solar': {
        displayName: "Solar",
        subtitle: "Tonatiuh Pixqui",
        description: "Ce huehue yaotl tlein oquichihuililoc Tonatiuh Teotl ipan miac tonal. Itemachtiliz chicahuac ihuan tlamati nochi yaoyotl ce tenyo.",
        quote: "Tonatiuh ceppa ihzati... ¿tihueliti tichihua nochi yeh?",
        modifiers: [
          "3 enemy units tlein quipiyah chicome ipan tlapechtli",
          "Chicoahualiztli IA: Yamanqui (Easy)",
          "IA pehua yaoyotl",
          "Tlatlaniz tlein quichihua 6 tlamahuichihualiztli"
        ],
        aiDifficulty: "Momachtiani (Yamanqui)"
      },
      'IrwingElSabio': {
        displayName: "Irwing Tlamatiliztli",
        subtitle: "Orco Mountain",
        description: "Ce orco hueyac tlein quipiya chicahuac ixtlamatiliztli. Nemiliztli izel ipan tepehuah ihuan ahmo icnoa tepalcatl. Tlahtoa chihton, zan tlein tlahtoa miquiztli.",
        quote: "Intla ticah nican... teca otimic ipan nehnemiliztli.",
        modifiers: [
          "3 fast units tlein quipiyah eyi ipan tlapechtli",
          "Chicoahualiztli IA: Yamanqui (Easy)",
          "IA pehua yaoyotl",
          "Tlatlaniz tlein quichihua 9 tlamahuichihualiztli"
        ],
        aiDifficulty: "Momachtiani (Yamanqui)"
      },
      'Shinigami': {
        displayName: "Shinigami",
        subtitle: "Huehue Miquizteotl",
        description: "Ce teotl yolic tlein yeppa nemi. Ahmo tlatehuia cocoliztli ahnozo tenyotl; zan tlamati mochi yolic tonalpan miquiztlan.",
        quote: "Mochi yaoyotl tlamiz nochi ce... zan moyeyecoa quezquilhuitl ticneltiliz.",
        modifiers: [
          "4 chicahuac tepozmalacatl tzacuah otli ce",
          "IA pehua ica ce Jack (J) ipan imac",
          "Chicoahualiztli IA: Ohuih (Hard)",
          "IA pehua yaoyotl",
          "Tlatlaniz tlein quichihua 12 tlamahuichihualiztli"
        ],
        aiDifficulty: "Tlamachtiloni (Ohuih)"
      },
      'Moon': {
        displayName: "Metztli",
        subtitle: "Coyoxauhqui Cihuatl",
        description: "Ce cihuatl qualnezqui ihuan yohuac tlein quicuiz chicahuac eztli teconyuh. Mochi tlatlaniliztli chicahua ichicahuiliz.",
        quote: "Eztli tlein chicahuac qualnezqui tlamati yehyecoltzin.",
        modifiers: [
          "4 medium units ihuan ce tepozmalacatl ipan tlapechtli",
          "IA pehua ica nochi Reyes (K) ipan imac",
          "Chicoahualiztli IA: Ohuih (Hard)",
          "IA pehua yaoyotl",
          "Tlatlaniz tlein quichihua 15 tlamahuichihualiztli"
        ],
        aiDifficulty: "Tlamachtiloni (Ohuih)"
      },
      'Katty': {
        displayName: "Katty",
        subtitle: "Tlamatilizteotl Cihuatl",
        description: "Ce cihuateotl chicahuac. Yeh tlamachtiani mochi teotzin ihuan pixqui tlamatiliztli. Mochi tlamachiliztli tyehyecolo miquilhuitl.",
        quote: "Tlamachiliztli momachtiz... zan tlamatiliztli tictlaniz.",
        modifiers: [
          "Achto pantli ica 4 fast units (row 1)",
          "Ompa pantli ica 2 medium units ihuan 2 tanks (row 0)",
          "IA pehua ica nochi Reinas (Q) ipan imac",
          "Chicoahualiztli IA: Ohuih (Hard)",
          "IA pehua yaoyotl",
          "Tlatlaniz tlein quichihua 18 tlamahuichihualiztli"
        ],
        aiDifficulty: "Tlamachtiloni (Ohuih)"
      },
      'King21': {
        displayName: "Rey 21",
        subtitle: "Hueyac Rey",
        description: "Tlein oquichihualiloc tlamahuichihualiztli. Teotl tlamachiliztli, hueyitlahtoani ihuan zancuic yaotl. Ahmo motta chicahuac; zan quinequi quittaz tla nemi acah hueliti quitlaniz.",
        quote: "Nehuatl oquichihualiloc otli... axcan xiquehyehua tinechtlaniz.",
        modifiers: [
          "Enemy vanguard ica 4 fast units (row 1)",
          "Enemy rearguard ica 4 tanks Speed 2!",
          "IA pehua ica: 1 K, 1 J, 1 Reina ihuan 1 Joker ipan imac",
          "Chicoahualiztli IA: Ohuih (Hard)",
          "IA pehua yaoyotl",
          "Tlatlaniz tlein quichihua 21 tlamahuichihualiztli"
        ],
        aiDifficulty: "Tlamachtiloni (Ohuih)"
      }
    }
  }
};
