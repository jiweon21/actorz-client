import React, { useState } from "react";
import Nav from "../components/Nav";
import { Link } from "react-router-dom";
import Post from "../pages/Post";
import Mypage from "../pages/Mypage";
import MypageEdit from "./MypageEdit";
import FileUpload from "../components/file-upload/file-upload.component";
import "../mainpage.css";

const Mainpage = () => {
  const [newfile, setNewFile] = useState({
    profileImages: [],
  });
  const [clickupload, setClickUpload] = useState(false);

  const handleClickUpload = (boolean) => {
    if (boolean) {
      setClickUpload(true);
    } else {
      setClickUpload(false);
    }
  };

  const updateUploadedFiles = (files) =>
    setNewFile({ ...newfile, profileImages: files });

  const handleSubmit = (event) => {
    event.preventDefault();
    // 여기에 이미지 올리는 로직 작성해야 함
  };

  return (
    <>
      <div className="blockhere">- </div>
      <div className="mainPage">
        <Nav />
        <div className="leftSpace"> </div>
        <div className="middleSpace">
          <div className="midContents">
            <Link to="post">
              <div className="user">송중기</div>
            </Link>

            <button onClick={() => handleClickUpload(true)}>
              게시물 작성{" "}
            </button>
            <Link to="/mypage">
              <button>마이 페이지 </button>
            </Link>
            <img
              src="https://media.vlpt.us/images/iooi75/post/cb112766-1934-4282-87ed-9c6384afa7e8/image.png"
              alt=""
              className="exampleIMG"
            />
          </div>
        </div>
        <div className="rightSpace"> </div>
        {clickupload ? (
          <div>
            <form onSubmit={handleSubmit}>
              <FileUpload
                accept=".jpg,.png,.jpeg, .mp4"
                multiple
                updateFilesCb={updateUploadedFiles}
                handleClickUpload={handleClickUpload}
              />
            </form>
          </div>
        ) : null}
      </div>
    </>
  );
};

export default Mainpage;
