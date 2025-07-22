import React from 'react';
import {
  FaFile,
  FaFilePdf,
  FaFileWord,
  FaFileExcel,
  FaFileImage,
  FaFileCode,
  FaFileAlt,
  FaFileArchive,
  FaFileAudio,
  FaFileVideo,
} from 'react-icons/fa';
import {
  DiJavascript,
  DiPython,
  DiHtml5,
  DiCss3,
  DiMarkdown,
  DiJava,
  DiReact,
  DiRuby,
  DiPhp,
  DiGo,
  DiSwift,
  DiScala,
  DiPerl,
  DiTerminal,
  DiDatabase,
} from 'react-icons/di';

const getFileExtension = (filename) => {
  return filename.split('.').pop().toLowerCase();
};

const FileIcon = ({ filename, className, style }) => {
  const extension = getFileExtension(filename);

  let IconComponent = FaFile;

  switch (extension) {
    case 'js':
    case 'jsx':
      IconComponent = DiJavascript;
      break;
    case 'ts':
    case 'tsx':
      IconComponent = FaFileCode;
      break;
    case 'py':
      IconComponent = DiPython;
      break;
    case 'html':
      IconComponent = DiHtml5;
      break;
    case 'css':
      IconComponent = DiCss3;
      break;
    case 'json':
      IconComponent = FaFileAlt;
      break;
    case 'md':
      IconComponent = DiMarkdown;
      break;
    case 'java':
      IconComponent = DiJava;
      break;
    case 'c':
    case 'cpp':
    case 'h':
    case 'hpp':
    case 'cxx':
      IconComponent = FaFileCode;
      break;
    case 'php':
      IconComponent = DiPhp;
      break;
    case 'rb':
      IconComponent = DiRuby;
      break;
    case 'go':
      IconComponent = DiGo;
      break;
    case 'swift':
      IconComponent = DiSwift;
      break;
    case 'kt':
      IconComponent = DiScala; // Kotlin icon not directly available in Di, using Scala as a placeholder
      break;
    case 'sh':
    case 'bat':
    case 'cmd':
      IconComponent = DiTerminal;
      break;
    case 'sql':
      IconComponent = DiDatabase;
      break;
    case 'txt':
    case 'log':
      IconComponent = FaFileAlt;
      break;
    case 'zip':
    case 'rar':
    case '7z':
      IconComponent = FaFileArchive;
      break;
    case 'pdf':
      IconComponent = FaFilePdf;
      break;
    case 'doc':
    case 'docx':
      IconComponent = FaFileWord;
      break;
    case 'xls':
    case 'xlsx':
      IconComponent = FaFileExcel;
      break;
    case 'ppt':
    case 'pptx':
      IconComponent = FaFileVideo; // Using video icon as a placeholder for now
      break;
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
    case 'bmp':
    case 'webp':
    case 'svg':
      IconComponent = FaFileImage;
      break;
    case 'mp3':
    case 'wav':
    case 'ogg':
      IconComponent = FaFileAudio;
      break;
    case 'mp4':
    case 'avi':
    case 'mov':
      IconComponent = FaFileVideo;
      break;
    default:
      IconComponent = FaFile;
  }

  return <IconComponent className={className} style={{ ...style, color: 'var(--text-color)' }} />;
};

export default FileIcon;
