"""
grag 是这个项目的内部 Python package。

这个文件本身不实现功能，只是告诉 Python：grag/ 目录可以被当作 package import。
例如 build_index.py 可以写：

from grag.kg_builder import build_graph

没有这个文件时，有些 Python 环境可能无法稳定识别 grag/ 里的模块。
"""
