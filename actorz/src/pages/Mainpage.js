import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useMediaQuery } from "react-responsive";
import server from "../apis/server";
import Nav from "../components/Nav";
import Post from "./Post";
import Iconlist from "../components/Iconlist";
import SocialSignup from "../components/SocialSignup";
import Footer from "../components/Footer";
import { getAllPostInfo } from "../actions/postAction";
import { getUserInfo } from "../actions/userAction";
import ResponsiveNav from "../components/responsiveApp/ResponsiveNav";
import ResponsiveFooter from "../components/responsiveApp/ResponsiveFooter";
import ResponsiveIconlistTablet from "../components/responsiveApp/ResponsiveIconlistTablet";
import Loading from "../components/loading";
import { redirectUri } from "../config";

import "../mainpage.css";
import "../styles/Search.css";
import "../styles/ResponsiveMainpage.css";
import "semantic-ui-css/semantic.min.css";
import "antd/dist/antd.css";
import { Card, Icon, Image } from "semantic-ui-react";
import { HeartOutlined } from "@ant-design/icons";
import { Modal } from "antd";
import NoContents from "../components/NoContents";

const Mainpage = () => {
  const [clickModal, setClickModal] = useState(false);
  const [isloading, setIsLoading] = useState(false);
  const [oauthSignup, setOauthSignup] = useState("");
  const [modalSocialSignup, setModalSocialSignup] = useState(false);
  const [isFilter, setIsFilter] = useState(false);
  const [clickLike, setClickLike] = useState(false);

  const post = useSelector((post) => post.postInfoReducer);
  const user = useSelector((user) => user.userInfoReducer);
  const dispatch = useDispatch();

  const loading = (boolean) => {
    setIsLoading(!boolean);
  };

  const handleClickPost = (boolean, id) => {
    if (boolean) {
      setClickModal(true);
      window.history.pushState(null, "", `/post/${id}`);
    } else {
      setClickModal(false);
      window.history.pushState(null, "", `/mainpage`);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    const getPostLists = async () => {
      try {
        await server.get(`/post`).then((res) => {
          if (res.status === 200) {
            dispatch(getAllPostInfo(res.data.data));
            setIsLoading(false);
          }
        });
      } catch (err) {
        setIsLoading(false);
        Modal.warning({
          title: "실패",
          content:
            "게시물 정보를 가져오는 중에 예상치 못한 오류가 발생했습니다  \n 잠시 후 다시 이용해주세요",
        });
      }
    };
    getPostLists();
  }, [dispatch, clickLike]);

  const isPc = useMediaQuery({
    query: "(min-width:1024px)",
  });

  const isTablet = useMediaQuery({
    query: "(min-width:768px) and (max-width:1023px)",
  });

  const isMobile = useMediaQuery({
    query: "(max-width:767px)",
  });

  useEffect(() => {
    setIsLoading(true);
    const oauthLogin = async () => {
      try {
        const [provider, code] = oauthSignup.split("=");
        if (!code.includes("@")) {
          await server
            .post(`/login/${provider}`, { code })
            .then(async (res) => {
              if (res.status === 200) {
                localStorage.setItem("accessToken", res.data.data.accessToken);
                localStorage.setItem("id", res.data.data.id);
                await server
                  .get(`/user/${localStorage.getItem("id")}`)
                  .then((res) => {
                    if (res.status === 200) {
                      setModalSocialSignup(false);
                      dispatch(
                        getUserInfo({
                          ...res.data.data.userInfo,
                          dob: res.data.data.userInfo.dob
                            .toString()
                            .split("T")[0],
                        })
                      );
                      window.location.href = redirectUri;
                    }
                  })
                  .catch((err) => {
                    setIsLoading(false);
                    throw err;
                  });
              } else if (res.status === 201) {
                setIsLoading(false);
                setModalSocialSignup(true);
                setOauthSignup(`${provider}=${res.data.data.email}`);
              } else {
                setIsLoading(false);

                Modal.warning({
                  title: "로그인 실패",
                  content: "소셜 로그인 중 오류가 발생했습니다.",
                });
                return;
              }
            });
          setIsLoading(false);
        }
      } catch (err) {
        setIsLoading(false);
      }
    };

    const parseQueryString = function () {
      const str = window.location.search;
      let objURL = {};

      str.replace(
        new RegExp("([^?=&]+)(=([^&]*))?", "g"),
        function ($0, $1, $2, $3) {
          objURL[$1] = $3;
        }
      );
      return objURL;
    };

    const getQuery = () => {
      const query = parseQueryString();
      if (query.code && !oauthSignup) {
        if (query.state) {
          query.provider = "naver";
        } else if (query.token) {
          query.provider = "google";
        }
        setOauthSignup(`${query.provider}=${query.code}`);
      } else {
        setIsLoading(false);
      }
    };
    getQuery();
    if (oauthSignup) {
      oauthLogin();
    }
  }, [oauthSignup, dispatch]);

  const handleClickFiltering = () => {
    setIsFilter(!isFilter);
  };

  const handleClickLikeBtn = async (state, post_id) => {
    let path = null;
    if (localStorage.getItem("accessToken")) {
      if (state === "unlike") {
        path = `/post/${post_id}/like`;
      } else if (state === "like") {
        path = `/post/${post_id}/unlike`;
      }

      await server
        .post(
          path,
          {},
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          }
        )
        .then((res) => {
          setClickLike(!clickLike);
        })
        .catch((err) => {
          throw err;
        });
    } else {
      return Modal.warning({
        title: "Login first",
        content: "로그인 후 이용 가능합니다.",
      });
    }
  };

  const { data } = post.data;
  return (
    <>
      {isPc && (
        <>
          <Nav loading={loading} handleClickFiltering={handleClickFiltering} />
          <div className="mainPage">
            <Iconlist />
            <div className="middleSpace">
              <div className="midContents2 midContentsReverse">
                {data ? (
                  data.posts.posts.length !== 0 ? (
                    data.posts.posts.map((post) => {
                      return (
                        <Card centered={true} fluid={true} key={post._id}>
                          <div
                            className="effecTest"
                            onClick={() => handleClickPost(true, post._id)}
                          >
                            <div className="screen">
                              <div className="bottom">
                                <HeartOutlined className="testIcon" />
                              </div>
                              {post.media.length !== 0 && post.media[0] ? (
                                post.media[0].type === "img" ? (
                                  <Image
                                    src={post.media[0].path}
                                    className="exampleIMG"
                                  />
                                ) : (
                                  <video
                                    autoPlay="autoplay"
                                    muted="muted"
                                    loop="loop"
                                    className="video"
                                    style={{ width: "100%", margin: 0 }}
                                  >
                                    <source
                                      src={post.media[0].path}
                                      className="exampleIMG"
                                    ></source>
                                  </video>
                                )
                              ) : null}
                            </div>
                          </div>

                          <Card.Content
                            onClick={() => handleClickPost(true, post._id)}
                          >
                            <Card.Header>
                              <div className="nothing">
                                {post.userInfo.name}
                              </div>
                            </Card.Header>
                            <Card.Meta>
                              <span className="date">
                                Updated at {post.updatedAt.split("T")[0]}{" "}
                                {post.updatedAt.split("T")[1].slice(0, 8)}
                              </span>
                            </Card.Meta>
                            <Card.Description>{post.content}</Card.Description>
                          </Card.Content>

                          <Card.Content extra>
                            {post.likes.length !== 0 &&
                            localStorage.getItem("accessToken") ? (
                              <>
                                {post.likes.findIndex(
                                  (i) => i.user_id === user.data.userInfo.id
                                ) !== -1 ? (
                                  <Icon
                                    name="like"
                                    className="mylike"
                                    onClick={(e) => {
                                      handleClickLikeBtn("like", post._id);
                                    }}
                                  />
                                ) : (
                                  <Icon
                                    name="like"
                                    className="unlike"
                                    onClick={() =>
                                      handleClickLikeBtn("unlike", post._id)
                                    }
                                  />
                                )}
                              </>
                            ) : (
                              <Icon
                                name="like"
                                className="unlike"
                                onClick={() =>
                                  handleClickLikeBtn("unlike", post._id)
                                }
                              />
                            )}
                            {post.likes.length}
                          </Card.Content>
                        </Card>
                      );
                    })
                  ) : (
                    <NoContents />
                  )
                ) : (
                  <Loading />
                )}
              </div>
            </div>
            <div className="rightSpace"></div>
          </div>
          <Footer />

          {clickModal ? (
            <Post
              clickModal={clickModal}
              closePost={() => handleClickPost(false)}
            />
          ) : null}

          {modalSocialSignup ? (
            <SocialSignup
              isMobile={false}
              oauthSignup={oauthSignup}
              modalSocialClose={() => {
                setModalSocialSignup(false);
              }}
            ></SocialSignup>
          ) : null}
        </>
      )}

      {isTablet && (
        <>
          <Nav loading={loading} handleClickFiltering={handleClickFiltering} />

          <div className="mainPageResponsive">
            <ResponsiveIconlistTablet />

            <div className="middleSpace2">
              <div className="midContentsResponsive midContentsReverse">
                {data ? (
                  data.posts.posts.length !== 0 ? (
                    data.posts.posts.map((post) => {
                      return (
                        <Card centered={true} fluid={true} key={post._id}>
                          <div
                            className="effecTest"
                            onClick={() => handleClickPost(true, post._id)}
                          >
                            <div
                              className="screen"
                              onClick={() => handleClickPost(true, post._id)}
                            >
                              <div className="bottom">
                                <HeartOutlined className="testIcon" />
                              </div>
                              {post.media.length !== 0 && post.media[0] ? (
                                post.media[0].type === "img" ? (
                                  <Image
                                    src={post.media[0].path}
                                    className="exampleIMG"
                                  />
                                ) : (
                                  <video
                                    autoPlay="autoplay"
                                    muted="muted"
                                    loop="loop"
                                    className="video"
                                    style={{ width: "100%", margin: 0 }}
                                  >
                                    <source
                                      src={post.media[0].path}
                                      className="exampleIMG"
                                    ></source>
                                  </video>
                                )
                              ) : null}
                            </div>
                          </div>

                          <Card.Content
                            onClick={() => handleClickPost(true, post._id)}
                          >
                            <Card.Header>
                              <div className="nothing">
                                {post.userInfo.name}
                              </div>
                            </Card.Header>
                            <Card.Meta>
                              <span className="date">
                                Updated at {post.updatedAt.split("T")[0]}{" "}
                                {post.updatedAt.split("T")[1].slice(0, 8)}
                              </span>
                            </Card.Meta>
                            <Card.Description>{post.content}</Card.Description>
                          </Card.Content>
                          <Card.Content
                            extra
                            onClick={() => handleClickPost(true, post._id)}
                          >
                            {post.likes.length !== 0 &&
                            localStorage.getItem("accessToken") ? (
                              <>
                                {post.likes.findIndex(
                                  (i) => i.user_id === user.data.userInfo.id
                                ) !== -1 ? (
                                  <Icon
                                    name="like"
                                    className="mylike"
                                    onClick={() =>
                                      handleClickLikeBtn("like", post._id)
                                    }
                                  />
                                ) : (
                                  <Icon
                                    name="like"
                                    className="unlike"
                                    onClick={() =>
                                      handleClickLikeBtn("unlike", post._id)
                                    }
                                  />
                                )}
                              </>
                            ) : (
                              <Icon
                                name="like"
                                className="unlike"
                                onClick={() =>
                                  handleClickLikeBtn("unlike", post._id)
                                }
                              />
                            )}
                            {post.likes.length}
                          </Card.Content>
                        </Card>
                      );
                    })
                  ) : (
                    <NoContents />
                  )
                ) : (
                  <Loading />
                )}
              </div>
            </div>
            <div className="responsiveNewblockPosition"> </div>
          </div>

          {clickModal ? (
            <Post
              clickModal={clickModal}
              closePost={() => handleClickPost(false)}
            />
          ) : null}

          {modalSocialSignup ? (
            <SocialSignup
              isMobile={false}
              oauthSignup={oauthSignup}
              modalSocialClose={() => {
                setModalSocialSignup(false);
              }}
            ></SocialSignup>
          ) : null}
        </>
      )}

      {isMobile && (
        <>
          <div className="mainPageResponsive2">
            <ResponsiveNav />
            <ResponsiveFooter />

            <div className="middleSpaceResponsive2">
              <div className="midContentsResponsive2 midContentsReverse">
                {data ? (
                  data.posts.posts.length !== 0 ? (
                    data.posts.posts.map((post) => {
                      return (
                        <Card centered={true} fluid={true} key={post._id}>
                          <div
                            className="effecTest"
                            onClick={() => handleClickPost(true, post._id)}
                          >
                            <div
                              className="screen"
                              onClick={() => handleClickPost(true, post._id)}
                            >
                              <div className="bottom">
                                <HeartOutlined className="testIcon" />
                              </div>
                              {post.media.length !== 0 && post.media[0] ? (
                                post.media[0].type === "img" ? (
                                  <Image
                                    src={post.media[0].path}
                                    className="exampleIMG"
                                  />
                                ) : (
                                  <video
                                    autoPlay="autoplay"
                                    muted="muted"
                                    loop="loop"
                                    className="video"
                                    style={{ width: "100%", margin: 0 }}
                                  >
                                    <source
                                      src={post.media[0].path}
                                      className="exampleIMG"
                                    ></source>
                                  </video>
                                )
                              ) : null}
                            </div>
                          </div>

                          <Card.Content
                            onClick={() => handleClickPost(true, post._id)}
                          >
                            <Card.Header>
                              <div className="nothing">
                                {post.userInfo.name}
                              </div>
                            </Card.Header>
                            <Card.Meta>
                              <span className="date">
                                Updated at {post.updatedAt.split("T")[0]}{" "}
                                {post.updatedAt.split("T")[1].slice(0, 8)}
                              </span>
                            </Card.Meta>
                            <Card.Description>{post.content}</Card.Description>
                          </Card.Content>
                          <Card.Content
                            extra
                            onClick={() => handleClickPost(true, post._id)}
                          >
                            {post.likes.length !== 0 &&
                            localStorage.getItem("accessToken") ? (
                              <>
                                {post.likes.findIndex(
                                  (i) => i.user_id === user.data.userInfo.id
                                ) !== -1 ? (
                                  <Icon
                                    name="like"
                                    className="mylike"
                                    onClick={() =>
                                      handleClickLikeBtn("like", post._id)
                                    }
                                  />
                                ) : (
                                  <Icon
                                    name="like"
                                    className="unlike"
                                    onClick={() =>
                                      handleClickLikeBtn("unlike", post._id)
                                    }
                                  />
                                )}
                              </>
                            ) : (
                              <Icon
                                name="like"
                                className="unlike"
                                onClick={() =>
                                  handleClickLikeBtn("unlike", post._id)
                                }
                              />
                            )}
                            {post.likes.length}
                          </Card.Content>
                        </Card>
                      );
                    })
                  ) : (
                    <NoContents />
                  )
                ) : (
                  <Loading />
                )}
              </div>
            </div>
          </div>

          {clickModal ? (
            <Post
              clickModal={clickModal}
              closePost={() => handleClickPost(false)}
            />
          ) : null}

          {modalSocialSignup ? (
            <SocialSignup
              isMobile={true}
              oauthSignup={oauthSignup}
              modalSocialClose={() => {
                setModalSocialSignup(false);
              }}
            ></SocialSignup>
          ) : null}
        </>
      )}
    </>
  );
};

export default Mainpage;
