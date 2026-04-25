from setuptools import setup, find_packages
from pathlib import Path

# Leer README para la descripción larga
README = Path(__file__).parent / "README.md"
long_description = README.read_text(encoding="utf-8") if README.exists() else ""

setup(
    name="solicitud-por-consignacion",
    version="1.0.0",
    author="Laboratorio Forense",
    author_email="forense@ejemplo.gob.ve",
    description="Sistema de Gestión Forense para Dispositivos Android",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/tu-usuario/solicitud-por-consignacion",
    packages=find_packages(exclude=["packaging", "assets"]),
    include_package_data=True,
    package_data={
        "": ["*.qss", "*.sql"],
    },
    install_requires=[
        "PyQt6>=6.6.0",
        "reportlab>=4.0.0",
        "Pillow>=10.0.0",
        "setuptools>=68.0.0",
    ],
    python_requires=">=3.11",
    entry_points={
        "gui_scripts": [
            "forense-android=main:main"
        ]
    },
    classifiers=[
        "Development Status :: 4 - Beta",
        "Environment :: X11 Applications :: Qt",
        "Intended Audience :: End Users/Desktop",
        "License :: OSI Approved :: MIT License",
        "Operating System :: POSIX :: Linux",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.11",
        "Topic :: Security",
    ],
)
