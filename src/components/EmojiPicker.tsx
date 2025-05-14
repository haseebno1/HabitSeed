import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search } from "lucide-react";

// Emoji category interface
interface EmojiCategory {
  id: string;
  name: string;
  icon: string;
  emojis: string[];
}

// Component props
interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  recentEmojis?: string[];
  className?: string;
}

// Emoji categories with their emojis
const EMOJI_CATEGORIES: EmojiCategory[] = [
  {
    id: "recent",
    name: "Recent",
    icon: "🕒",
    emojis: [] // Will be populated from props or localStorage
  },
  {
    id: "smileys",
    name: "Smileys",
    icon: "😊",
    emojis: ["😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "🥲", "☺️", "😊", "😇", "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "😚", "😋", "😛", "😝", "😜", "🤪", "🤨", "🧐", "🤓", "😎", "🥸", "🤩", "🥳", "😏", "😒", "😞", "😔", "😟", "😕", "🙁", "☹️", "😣", "😖", "😫", "😩"]
  },
  {
    id: "people",
    name: "People",
    icon: "👨",
    emojis: ["👶", "👧", "🧒", "👦", "👩", "🧑", "👨", "👱‍♀️", "👱", "👴", "👵", "🧓", "👲", "👳‍♀️", "👳", "🧕", "👮‍♀️", "👮", "👷‍♀️", "👷", "💂‍♀️", "💂", "🕵️‍♀️", "🕵️", "👩‍⚕️", "👨‍⚕️", "👩‍🌾", "👨‍🌾", "👩‍🍳", "👨‍🍳", "👩‍🎓", "👨‍🎓", "👩‍🎤", "👨‍🎤", "👩‍🏫", "👨‍🏫"]
  },
  {
    id: "activities",
    name: "Activities",
    icon: "⚽",
    emojis: ["⚽", "🏀", "🏈", "⚾", "🥎", "🎾", "🏐", "🏉", "🥏", "🎱", "🪀", "🏓", "🏸", "🏒", "🏑", "🥍", "🏏", "🪃", "🥅", "⛳", "🪁", "🏹", "🎣", "🤿", "🥊", "🥋", "🎽", "🛹", "🛼", "🛷", "⛸️", "🥌", "🎿", "⛷️", "🏂", "🪂", "🏋️‍♀️", "🏋️", "🤼‍♀️", "🤼", "🤸‍♀️", "🤸", "⛹️‍♀️", "⛹️", "🤺", "🤾‍♀️", "🤾", "🏌️‍♀️", "🏌️", "🏇", "🧘‍♀️", "🧘", "🏄‍♀️", "🏄", "🏊‍♀️", "🏊", "🤽‍♀️", "🤽", "🚣‍♀️", "🚣", "🧗‍♀️", "🧗", "🚵‍♀️", "🚵", "🚴‍♀️", "🚴", "🏆", "🥇", "🥈", "🥉", "🏅", "🎖️", "🏵️", "🎗️", "🎫", "🎟️", "🎪", "🤹‍♀️", "🤹", "🎭", "🎨", "🎬", "🎤", "🎧", "🎼", "🎹", "🥁", "🪘", "🎷", "🎺", "🪗", "🎸", "🪕", "🎻"]
  },
  {
    id: "nature",
    name: "Nature",
    icon: "🌲",
    emojis: ["🌱", "🌲", "🌳", "🌴", "🌵", "🌾", "🌿", "☘️", "🍀", "🍁", "🍂", "🍃", "🍄", "🌰", "🦀", "🦞", "🦐", "🦑", "🦆", "🦅", "🦉", "🦇", "🐺", "🐗", "🐴", "🦄", "🐝", "🪱", "🐛", "🦋", "🐌", "🐞", "🐜", "🪰", "🪲", "🪳", "🦟", "🦗", "🕷️", "🕸️", "🦂", "🐢", "🐍", "🦎", "🦖", "🦕", "🐙", "🦑", "🦐", "🦞", "🦀", "🐡", "🐠", "🐟", "🐬", "🐳", "🐋", "🦈", "🐊", "🐅", "🐆", "🦓", "🦍", "🦧", "🦣", "🐘", "🦛", "🦏", "🐪", "🐫", "🦒", "🦘", "🦬", "🐃", "🐂", "🐄", "🐎", "🐖", "🐏", "🐑", "🦙", "🐐", "🦌"]
  },
  {
    id: "food",
    name: "Food",
    icon: "🍎",
    emojis: ["🍇", "🍈", "🍉", "🍊", "🍋", "🍌", "🍍", "🥭", "🍎", "🍏", "🍐", "🍑", "🍒", "🍓", "🫐", "🥝", "🍅", "🫒", "🥥", "🥑", "🍆", "🥔", "🥕", "🌽", "🌶️", "🫑", "🥒", "🥬", "🥦", "🧄", "🧅", "🍄", "🥜", "🌰", "🍞", "🥐", "🥖", "🫓", "🥨", "🥯", "🥞", "🧇", "🧀", "🍖", "🍗", "🥩", "🥓", "🍔", "🍟", "🍕", "🌭", "🥪", "🌮", "🌯", "🫔", "🥙", "🧆", "🥚", "🍳", "🥘", "🍲", "🫕", "🥣", "🥗", "🍿", "🧈", "🧂", "🥫", "🍱", "🍘", "🍙", "🍚", "🍛", "🍜", "🍝", "🍠", "🍢", "🍣", "🍤", "🍥", "🥮", "🍡", "🥟", "🥠", "🥡", "🦪", "🍦", "🍧", "🍨", "🍩", "🍪", "🎂", "🍰", "🧁", "🥧", "🍫", "🍬", "🍭", "🍮", "🍯", "🍼", "🥛", "☕", "🫖", "🍵", "🍶", "🍾", "🍷", "🍸", "🍹", "🍺", "🍻", "🥂", "🥃", "🥤", "🧋", "🧃", "🧉", "🧊"]
  },
  {
    id: "travel",
    name: "Travel",
    icon: "🚗",
    emojis: ["🚗", "🚕", "🚙", "🚌", "🚎", "🏎️", "🚓", "🚑", "🚒", "🚐", "🛻", "🚚", "🚛", "🚜", "🦯", "🦽", "🦼", "🛴", "🚲", "🛵", "🏍️", "🛺", "🚨", "🚔", "🚍", "🚘", "🚖", "🚡", "🚠", "🚟", "🚃", "🚋", "🚞", "🚝", "🚄", "🚅", "🚈", "🚂", "🚆", "🚇", "🚊", "🚉", "✈️", "🛫", "🛬", "🛩️", "💺", "🛰️", "🚀", "🛸", "🚁", "🛶", "⛵", "🚤", "🛥️", "🛳️", "⛴️", "🚢", "⚓", "🪝", "⛽", "🚧", "🚦", "🚥", "🚏", "🗺️", "🗿", "🗽", "🗼", "🏰", "🏯", "🏟️", "🎡", "🎢", "🎠", "⛲", "⛱️", "🏖️", "🏝️", "🏜️", "🌋", "⛰️", "🏔️", "🗻", "🏕️", "⛺", "🏠", "🏡", "🏘️", "🏚️", "🏗️", "🏢", "🏭", "🏬", "🏣", "🏤", "🏥", "🏦", "🏨", "🏪", "🏫", "🏩", "💒", "🏛️", "⛪", "🕌", "🕍", "🛕", "🕋", "⛩️", "🛤️", "🛣️", "🗾", "🎑", "🏞️", "🌅", "🌄", "🌠", "🎇", "🎆", "🌇", "🌆", "🏙️", "🌃", "🌌", "🌉", "🌁"]
  },
  {
    id: "objects",
    name: "Objects",
    icon: "💡",
    emojis: ["⌚", "📱", "📲", "💻", "⌨️", "🖥️", "🖨️", "🖱️", "🖲️", "🕹️", "🗜️", "💽", "💾", "💿", "📀", "📼", "📷", "📸", "📹", "🎥", "📽️", "🎞️", "📞", "☎️", "📟", "📠", "📺", "📻", "🎙️", "🎚️", "🎛️", "🧭", "⏱️", "⏲️", "⏰", "🕰️", "⌛", "⏳", "📡", "🔋", "🔌", "💡", "🔦", "🕯️", "🪔", "🧯", "🛢️", "💸", "💵", "💴", "💶", "💷", "🪙", "💰", "💳", "💎", "⚖️", "🪜", "🧰", "🪛", "🔧", "🔨", "⚒️", "🛠️", "🧲", "🪚", "🔩", "⚙️", "🪤", "🧱", "⛓️", "🧪", "🧫", "🧬", "🔭", "🔬", "🕳️", "💊", "💉", "🩸", "🩹", "🩺", "🩻", "🩼", "🚪", "🛗", "🪞", "🪟", "🛏️", "🛋️", "🪑", "🚽", "🪠", "🚿", "🛁", "🪤", "🪒", "🧴", "🧷", "🧹", "🧺", "🧻", "🪣", "🧼", "🫧", "🪥", "🧽", "🧯", "🛒", "🚬", "⚰️", "🪦", "⚱️", "🗿", "🪧", "🏧", "🚮", "🚰", "♿", "🚹", "🚺", "🚻", "🚼", "🚾", "🛂", "🛃", "🛄", "🛅"]
  },
  {
    id: "symbols",
    name: "Symbols",
    icon: "❤️",
    emojis: ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔", "❣️", "💕", "💞", "💓", "💗", "💖", "💘", "💝", "💟", "☮️", "✝️", "☪️", "🕉️", "☸️", "✡️", "🔯", "🕎", "☯️", "☦️", "🛐", "⛎", "♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓", "🆔", "⚛️", "🉑", "☢️", "☣️", "📴", "📳", "🈶", "🈚", "🈸", "🈺", "🈷️", "✴️", "🆚", "💮", "🉐", "㊙️", "㊗️", "🈴", "🈵", "🈹", "🈲", "🅰️", "🅱️", "🆎", "🆑", "🅾️", "🆘", "❌", "⭕", "🛑", "⛔", "📛", "🚫", "💯", "💢", "♨️", "🚷", "🚯", "🚳", "🚱", "🔞", "📵", "🚭", "❗", "❕", "❓", "❔", "‼️", "⁉️", "🔅", "🔆", "〽️", "⚠️", "🚸", "🔱", "⚜️", "🔰", "♻️", "✅", "🈯", "💹", "❇️", "✳️", "❎", "🌐", "💠", "Ⓜ️", "🌀", "💤", "🏧", "🚾", "♿", "🅿️", "🛗", "🈳", "🈂️", "🛂", "🛃", "🛄", "🛅", "🚹", "🚺", "🚼", "⚧", "🚻", "🚮", "🎦", "📶", "🈁", "🔣", "ℹ️", "🔤", "🔡", "🔠", "🆖", "🆗", "🆙", "🆒", "🆕", "🆓", "0️⃣", "1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟", "🔢", "#️⃣", "*️⃣", "⏏️", "▶️", "⏸️", "⏺️", "⏭️", "⏮️", "⏩", "⏪", "⏫", "⏬", "◀️", "🔼", "🔽", "➡️", "⬅️", "⬆️", "⬇️", "↗️", "↘️", "↙️", "↖️", "↕️", "↔️", "↪️", "↩️", "⤴️", "⤵️", "🔀", "🔁", "🔂", "🔄", "🔃", "🎵", "🎶", "➕", "➖", "➗", "✖️", "✔️", "🟰", "➰", "➿", "〰️", "©️", "®️", "™️", "🔘", "🔳", "🔲", "🔴", "🟠", "🟡", "🟢", "🔵", "🟣", "⚫", "⚪", "🟤", "🔸", "🔹", "🔶", "🔷", "🔺", "▪️", "▫️", "⬛", "⬜", "🟥", "🟧", "🟨", "🟩", "🟦", "🟪", "🟫"]
  },
  {
    id: "habits",
    name: "Habits",
    icon: "✅",
    emojis: ["✅", "📝", "📚", "💪", "🧘‍♀️", "🏃‍♂️", "💧", "🍎", "🥗", "💊", "💤", "🌅", "🧹", "💼", "💰", "📱", "🎯", "⏰", "🧠", "📈", "🚫", "🍷", "🚬", "🧘", "🍽️", "🥦", "🥤", "👨‍👩‍👧‍👦", "👋", "🔄", "📆", "🛌", "🌱", "🌿", "🥕", "🚶", "🧘", "📖", "✍️", "🧠", "💭", "❤️", "🧘‍♂️", "🌊"]
  }
];

// Maximum number of emojis to show in Recent category
const MAX_RECENT_EMOJIS = 20;

// Local storage key for recent emojis
const RECENT_EMOJIS_KEY = "recent-emojis";

const EmojiPicker: React.FC<EmojiPickerProps> = ({
  onEmojiSelect,
  recentEmojis = [],
  className = ""
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("recent");
  const [emojiCategories, setEmojiCategories] = useState<EmojiCategory[]>(EMOJI_CATEGORIES);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Initialize emoji categories with recent emojis
  useEffect(() => {
    const storedRecentEmojis = localStorage.getItem(RECENT_EMOJIS_KEY);
    let recentEmojiList: string[] = [];

    if (storedRecentEmojis) {
      try {
        recentEmojiList = JSON.parse(storedRecentEmojis);
      } catch (error) {
        console.error("Failed to parse recent emojis:", error);
      }
    }

    // Use provided recent emojis if available, otherwise use stored ones
    const userRecentEmojis = recentEmojis.length > 0 ? recentEmojis : recentEmojiList;

    // Update the Recent category in the list
    setEmojiCategories(prevCategories => {
      return prevCategories.map(category => {
        if (category.id === "recent") {
          return { ...category, emojis: userRecentEmojis };
        }
        return category;
      });
    });
  }, [recentEmojis]);

  // Focus search input when component mounts
  useEffect(() => {
    if (searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, []);

  // Handle emoji selection
  const handleEmojiSelect = (emoji: string) => {
    onEmojiSelect(emoji);
    addToRecentEmojis(emoji);
  };

  // Add emoji to recent emojis
  const addToRecentEmojis = (emoji: string) => {
    // Get current recent emojis from local storage
    const storedRecentEmojis = localStorage.getItem(RECENT_EMOJIS_KEY);
    let recentEmojiList: string[] = [];

    if (storedRecentEmojis) {
      try {
        recentEmojiList = JSON.parse(storedRecentEmojis);
      } catch (error) {
        console.error("Failed to parse recent emojis:", error);
      }
    }

    // Remove emoji if it already exists in the list
    recentEmojiList = recentEmojiList.filter(e => e !== emoji);

    // Add emoji to the beginning of the list
    recentEmojiList.unshift(emoji);

    // Limit the list size
    if (recentEmojiList.length > MAX_RECENT_EMOJIS) {
      recentEmojiList = recentEmojiList.slice(0, MAX_RECENT_EMOJIS);
    }

    // Update local storage
    localStorage.setItem(RECENT_EMOJIS_KEY, JSON.stringify(recentEmojiList));

    // Update state
    setEmojiCategories(prevCategories => {
      return prevCategories.map(category => {
        if (category.id === "recent") {
          return { ...category, emojis: recentEmojiList };
        }
        return category;
      });
    });
  };

  // Get filtered emojis based on search term
  const getFilteredEmojis = () => {
    if (!searchTerm.trim()) {
      // If no search term, show selected category
      const category = emojiCategories.find(c => c.id === selectedCategory);
      return category ? category.emojis : [];
    }

    // If search term exists, search across all categories
    const allEmojis: string[] = [];
    emojiCategories.forEach(category => {
      // Skip the "recent" category when searching
      if (category.id !== "recent") {
        allEmojis.push(...category.emojis);
      }
    });

    // Remove duplicates
    const uniqueEmojis = [...new Set(allEmojis)];

    // Very simple fuzzy search - emojis don't have good text representation for searching
    // In a real implementation, you'd want emoji metadata with tags/keywords
    return uniqueEmojis.filter(emoji => emoji.includes(searchTerm.toLowerCase()));
  };

  // Render emoji grid
  const renderEmojiGrid = () => {
    const emojis = getFilteredEmojis();

    if (emojis.length === 0 && selectedCategory === "recent" && !searchTerm) {
      return (
        <div className="p-8 text-center text-muted-foreground text-sm flex flex-col items-center justify-center h-32">
          <div className="text-2xl mb-2">😊</div>
          <p>No recent emojis yet</p>
          <p>Selected emojis will appear here</p>
        </div>
      );
    }

    if (emojis.length === 0 && searchTerm) {
      return (
        <div className="p-8 text-center text-muted-foreground text-sm flex flex-col items-center justify-center h-32">
          <div className="text-2xl mb-2">🔍</div>
          <p>No emojis found</p>
          <p>Try another search term</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-6 sm:grid-cols-8 gap-1 p-2">
        {emojis.map((emoji, index) => (
          <Button
            key={`${emoji}-${index}`}
            variant="ghost"
            className="h-9 w-9 p-0 hover:bg-accent"
            onClick={() => handleEmojiSelect(emoji)}
          >
            <span className="text-xl">{emoji}</span>
          </Button>
        ))}
      </div>
    );
  };

  return (
    <div className={`border rounded-md shadow-sm bg-background ${className}`}>
      {/* Search input */}
      <div className="p-2 border-b relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={searchInputRef}
          placeholder="Search emojis..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-8"
        />
      </div>

      {/* Emoji categories */}
      <Tabs
        defaultValue="recent"
        value={selectedCategory}
        onValueChange={(value) => {
          setSelectedCategory(value);
          setSearchTerm("");
        }}
        className="w-full"
      >
        <div className="border-b overflow-x-auto">
          <TabsList className="flex w-full justify-start h-auto p-1 bg-transparent">
            {emojiCategories.map((category) => (
              <TabsTrigger
                key={category.id}
                value={category.id}
                className="px-2 sm:px-3 py-1 sm:py-2 text-sm flex-shrink-0 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground data-[state=active]:shadow-none"
              >
                <span className="text-lg mr-1">{category.icon}</span>
                <span className="hidden sm:inline">{category.name}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* Emoji content */}
        <ScrollArea className="h-[250px] md:h-[300px]">
          {renderEmojiGrid()}
        </ScrollArea>
      </Tabs>
    </div>
  );
};

export default EmojiPicker; 