import React from "react";
import { Button, Menu, Portal, HStack, Separator } from "@chakra-ui/react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "./reducers/userSlice";
import { getPersonName } from "best-modules/utils";

function Header() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector((state) => state.user.user);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <div className="header">
      <HStack
        className="header__container"
        justify="space-between"
        width="100%"
        px={4}
      >
        <div className="logotypeBlock">
          <Link to="/home" className="logo font">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              version="1.0"
              width="30"
              height="30"
              viewBox="0 0 512.000000 512.000000"
              preserveAspectRatio="xMidYMid meet"
            >
              <g
                transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)"
                fill="#000000"
                stroke="none"
              >
                <path d="M843 4948 c-12 -6 -26 -22 -32 -37 -8 -18 -11 -543 -9 -1821 l3 -1795 22 -80 c68 -240 226 -443 433 -553 69 -37 1273 -502 1300 -502 27 0 1231 465 1300 501 208 112 365 314 433 554 l22 80 3 1795 c2 1275 -1 1803 -8 1821 -6 15 -23 31 -36 38 -34 15 -3399 15 -3431 -1z m3315 -1900 l-3 -1753 -26 -77 c-15 -42 -43 -107 -64 -145 -49 -88 -179 -218 -265 -266 -65 -36 -1210 -477 -1239 -477 -25 0 -1120 418 -1211 463 -68 33 -103 59 -171 127 -95 94 -145 174 -188 298 l-26 77 -3 1753 -2 1752 1600 0 1600 0 -2 -1752z" />
                <path d="M2501 4364 c-21 -26 -21 -33 -21 -744 0 -789 -1 -807 -61 -985 -34 -100 -216 -465 -236 -472 -22 -8 -150 36 -182 62 -86 73 -57 250 49 301 19 9 46 22 60 28 44 20 49 47 39 211 -36 604 -161 966 -420 1208 -148 140 -217 169 -269 117 -20 -20 -20 -39 -20 -1230 l0 -1211 25 -24 24 -25 288 0 289 0 17 -88 c36 -175 109 -301 280 -478 60 -63 117 -129 126 -147 31 -61 111 -61 142 0 9 18 65 84 126 146 167 174 239 296 276 468 l22 99 288 0 288 0 24 25 25 24 0 1205 0 1205 -23 27 c-34 39 -73 36 -144 -12 -78 -53 -220 -195 -268 -269 -161 -245 -253 -607 -272 -1061 -6 -145 -5 -152 15 -172 12 -12 34 -25 49 -28 43 -11 81 -41 109 -90 23 -39 26 -53 22 -109 -3 -44 -10 -74 -24 -92 -27 -37 -120 -83 -174 -86 l-44 -2 -97 189 c-53 103 -110 229 -128 280 -60 176 -61 197 -61 986 0 711 0 718 -21 744 -16 20 -29 26 -59 26 -30 0 -43 -6 -59 -26z m-754 -658 c132 -196 211 -503 238 -916 l7 -105 -27 -15 c-44 -23 -132 -125 -150 -174 l-18 -46 -98 0 -99 0 0 712 0 712 51 -49 c28 -28 71 -81 96 -119z m1773 -546 l0 -710 -98 0 -98 0 -27 55 c-31 63 -84 125 -134 156 l-36 22 7 121 c18 326 85 620 187 816 47 89 168 250 189 250 6 0 10 -267 10 -710z m-925 -690 c15 -36 61 -129 102 -208 41 -79 74 -144 72 -146 -2 -1 -29 -13 -59 -26 -30 -14 -76 -45 -102 -68 l-47 -44 -43 42 c-24 23 -71 55 -105 71 l-63 30 90 177 c50 97 96 194 102 215 14 45 18 41 53 -43z m-786 -237 c35 -103 106 -165 236 -205 38 -12 71 -23 73 -24 1 -1 -6 -35 -17 -75 -11 -41 -23 -95 -27 -121 l-6 -48 -234 0 -234 0 0 265 0 266 96 -3 95 -3 18 -52z m1711 -208 l0 -265 -234 0 -234 0 -6 48 c-4 26 -16 80 -27 121 -11 40 -18 75 -17 76 2 1 35 12 73 24 132 42 209 113 237 215 l12 46 98 0 98 0 0 -265z m-1128 -106 c30 -22 78 -108 78 -141 0 -16 -12 -18 -120 -18 -108 0 -120 2 -120 18 0 22 26 129 39 164 10 27 10 27 51 13 23 -8 55 -24 72 -36z m470 -11 c9 -30 19 -76 23 -102 l7 -46 -122 0 -123 0 6 37 c10 58 55 114 117 146 30 15 59 26 64 24 6 -2 18 -28 28 -59z m-382 -533 c0 -124 -3 -225 -7 -224 -19 1 -131 144 -169 214 -38 70 -74 177 -74 220 0 13 19 15 125 15 l125 0 0 -225z m410 209 c0 -41 -35 -146 -73 -218 -23 -43 -72 -112 -109 -152 l-68 -74 0 230 0 230 125 0 c108 0 125 -2 125 -16z" />
              </g>
            </svg>
          </Link>
          <span style={{ fontWeight: 600 }}>E-document</span>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <div>
            <span
              style={{
                display: "flex",
                alignItems: "center",
                color: "white",
                fontWeight: 600,
              }}
            >
              {getPersonName(user, { initials: true })}
            </span>
          </div>

          <HStack gap={4}>
            <Menu.Root positioning={{ placement: "bottom-end" }}>
              <Menu.Trigger asChild>
                <Button
                  variant="ghost"
                  color="white"
                  size="md"
                  borderRadius="full"
                  _hover={{ bg: "whiteAlpha.300" }}
                  p={2}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 30 30"
                    width="24px"
                    height="24px"
                  >
                    <path d="M 3 7 A 1.0001 1.0001 0 1 0 3 9 L 27 9 A 1.0001 1.0001 0 1 0 27 7 L 3 7 z M 3 14 A 1.0001 1.0001 0 1 0 3 16 L 27 16 A 1.0001 1.0001 0 1 0 27 14 L 3 14 z M 3 21 A 1.0001 1.0001 0 1 0 3 23 L 27 23 A 1.0001 1.0001 0 1 0 27 21 L 3 21 z" />
                  </svg>
                </Button>
              </Menu.Trigger>

              <Portal>
                <Menu.Positioner>
                  <Menu.Content
                    minW="180px"
                    borderRadius="xl"
                    boxShadow="lg"
                    p={1}
                    bg="white"
                    color="gray.800"
                  >
                    <Menu.Item
                      value="logout"
                      cursor="pointer"
                      borderRadius="lg"
                      color="red.600"
                      _hover={{ bg: "red.50" }}
                      onClick={handleLogout}
                    >
                      <HStack gap={3}>
                        <span>🚪</span>
                        <span>Вийти з системи</span>
                      </HStack>
                    </Menu.Item>
                  </Menu.Content>
                </Menu.Positioner>
              </Portal>
            </Menu.Root>
          </HStack>
        </div>
      </HStack>
    </div>
  );
}

export default Header;
