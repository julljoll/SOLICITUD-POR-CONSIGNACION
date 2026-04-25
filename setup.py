from setuptools import setup, find_packages

setup(
    name="forense-android",
    version="1.0.0",
    packages=find_packages(),
    install_requires=[
        "PyQt6>=6.6.0",
        "reportlab>=4.0.0",
        "Pillow>=10.0.0"
    ],
    entry_points={
        "console_scripts": [
            "forense-android=main:main"
        ]
    }
)
