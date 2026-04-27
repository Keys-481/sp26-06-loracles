# sp26-06-loracles
## LSU HTR

## Members
  * James Maloney
  * Mason Swanson
  * Porter Rigby

## Abstract
LSU HTR is a cross-platform solution for handwritten text recognition on historical document images. Inference for 
optical character recognition has traditionally been locked behind some level of technical know-how, requiring the 
knowledge of utilizing different models either through pure Python code or via some form of coding notebook. This 
gatekeeps the use of machine learning for HTR from many individuals studying the humanities, who would massively benefit 
from access to such technology. LSU HTR attempts to provide an easy-to-use solution for handwritten text recognition of 
historical documents, accessible to everyone.

LSU HTR can be run on Windows, macOS, (and Linux for more technical users) through Electron and a built-in Python engine. 
It can be packaged for both Windows and macOS platforms, and automatically detects and enables hardware acceleration for 
Nvidia GPUs.

The app allows for importing different HTR and Line Segmentation models, loading image documents, and running inference 
to parse the text from those documents. Once inference has been done, the resulting text is output for human review and 
available for saving/downloading into text files.

## Project Description
The application's architecture is comprised of two main components:
- A NodeJS backend and corresponding frontend built with React and Vite, hosted in Electron
- A Python inference server running alongside Electron

The Python server runs alongside Electron, waiting for inference jobs to be triggered. Communication between the two
processes is done via ZeroMQ using a Router-Dealer pattern, enabling topic-based message passing for fine-grained
control and extensibility.

Included with the Python source code is an interface for adding additional model modules, allowing for use with new
checkpoints and model architectures.
