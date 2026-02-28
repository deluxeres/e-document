import React from "react";
import { Button, Menu, Portal, HStack, Image, Box } from "@chakra-ui/react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "./reducers/userSlice";
import { getPersonName } from "best-modules/utils";

function Header() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector((state) => state.user.user);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  const handleProfile = () => {
    navigate("/profile");
  };

  const navLinkStyles = ({ isActive }) => ({
    textDecoration: "none",
    color: "white",
    fontWeight: 600,
    fontSize: "14px",
    padding: "8px 16px",
    borderRadius: "8px",
    backgroundColor: isActive ? "rgba(255, 255, 255, 0.2)" : "transparent",
    transition: "all 0.2s",
  });

  return (
    <Box as="nav" className="header" bg="black" py={2}>
      <HStack
        className="header__container"
        justify="space-between"
        width="100%"
        px={6}
        maxW="1400px"
        mx="auto"
      >
        <HStack gap={8}>
          <HStack as={Link} to="/" gap={2} _hover={{ textDecoration: "none" }}>
            <Box color="white" fontWeight="bold" fontSize="xl">
              E-document
            </Box>
          </HStack>

          {user && (
            <HStack gap={2} ml={4}>
              <NavLink to="/dashboard" style={navLinkStyles}>
                Дашборд
              </NavLink>
              <NavLink to="/home" style={navLinkStyles}>
                Документи
              </NavLink>
            </HStack>
          )}
        </HStack>

        {/* Профиль и Меню */}
        {user && (
          <HStack gap={4}>
            <HStack gap={3}>
              <Box color="white" textAlign="right" hideBelow="md">
                <Box fontWeight="bold" fontSize="sm">
                  {getPersonName(user, { initials: true })}
                </Box>
              </Box>
              <Image
                src={user?.photo_url}
                alt="User Photo"
                w="36px"
                h="36px"
                rounded="full"
                objectFit="cover"
                border="2px solid white"
              />
            </HStack>

            <Menu.Root positioning={{ placement: "bottom-end" }}>
              <Menu.Trigger asChild>
                <Button
                  variant="ghost"
                  color="white"
                  borderRadius="full"
                  _hover={{ bg: "whiteAlpha.300" }}
                  px={2}
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
                    minW="200px"
                    borderRadius="xl"
                    boxShadow="xl"
                    p={1}
                    bg="white"
                  >
                    <Menu.Item
                      value="profile"
                      onClick={handleProfile}
                      cursor="pointer"
                      p={3}
                      borderRadius="lg"
                    >
                      Особистий кабінет
                    </Menu.Item>
                    <Menu.Item
                      value="logout"
                      onClick={handleLogout}
                      cursor="pointer"
                      p={3}
                      borderRadius="lg"
                      color="red.600"
                    >
                      Вийти з системи
                    </Menu.Item>
                  </Menu.Content>
                </Menu.Positioner>
              </Portal>
            </Menu.Root>
          </HStack>
        )}
      </HStack>
    </Box>
  );
}

export default Header;
